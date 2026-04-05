import DisasterReport from '../models/DisasterReport.js';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import { haversineDistance } from '../utils/geo.js';

// @desc    Create a new disaster report (or SOS)
export const createReport = async (req, res) => {
  try {
    const { disasterType, description, location, urgencyLevel, images, isSOS, neededResources } = req.body;
    if (!disasterType || !location || !location.coordinates) {
      return res.status(400).json({ message: 'Missing required fields: disasterType and location' });
    }
    const finalUrgency = isSOS ? 'critical' : (urgencyLevel || 'medium');
    const report = new DisasterReport({
      victim: req.user.id,
      disasterType,
      description,
      location: { type: 'Point', coordinates: location.coordinates },
      urgencyLevel: finalUrgency,
      images: images || [],
      isSOS: isSOS || false,
      neededResources: neededResources || [],
    });
    await report.save();
    console.log(`📤 Emitting new-report event for report: ${report._id}`);
    const io = req.app.get('io');
    io.emit('new-report', report);
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get nearby reports for NGO (within radius)
export const getNearbyReports = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Latitude and longitude are required' });
    const radiusInMeters = radius * 1000;
    const reports = await DisasterReport.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters,
        },
      },
      status: 'pending',
    }).populate('victim', 'name phone');
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get ranked NGO recommendations for a report
export const getRecommendations = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    const [lng, lat] = report.location.coordinates;
    const ngos = await User.find({ role: 'ngo', verified: true, location: { $exists: true } }).select('name location');
    if (ngos.length === 0) return res.json([]);
    const scored = await Promise.all(ngos.map(async (ngo) => {
      const [ngoLat, ngoLng] = ngo.location.coordinates;
      const distance = haversineDistance(lat, lng, ngoLat, ngoLng);
      const resources = await Resource.find({ ngo: ngo._id });
      let resourceScore = 0;
      for (const res of resources) resourceScore += res.quantity;
      const distanceScore = 1 / (distance + 1);
      const totalScore = distanceScore + (resourceScore / 100);
      return {
        ngo: { id: ngo._id, name: ngo.name, location: ngo.location.coordinates },
        distance,
        resourceScore,
        distanceScore,
        totalScore,
      };
    }));
    scored.sort((a, b) => b.totalScore - a.totalScore);
    res.json(scored);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept a report (assign to NGO) + auto-deduct resources
export const acceptReport = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.status !== 'pending') {
      return res.status(400).json({ message: 'Report already accepted or resolved' });
    }
    report.status = 'accepted';
    report.assignedNgo = req.user.id;
    await report.save();

    const needed = report.neededResources || [];
    const deductionAmount = 10; // or use exact quantity from victim if you stored it
    const lowStockAlerts = [];
  console.log('=== ACCEPT REPORT ===');
console.log('Report neededResources:', JSON.stringify(needed));
for (const need of needed) {
  console.log(`Looking for resource: ${need.resourceType}, needed quantity: ${need.quantity}`);
  const resource = await Resource.findOne({ ngo: req.user.id, resourceType: need.resourceType });
  if (resource) {
    console.log(`Found resource, old quantity: ${resource.quantity}`);
    const deduction = need.quantity;
    resource.quantity = Math.max(0, resource.quantity - deduction);
    await resource.save();
    console.log(`New quantity: ${resource.quantity}`);
  } else {
    console.log(`❌ Resource not found for type: ${need.resourceType}`);
  }
}    const io = req.app.get('io');
    io.emit('report-accepted', { reportId: report._id, assignedNgo: req.user.id, victimId: report.victim });
    io.emit('resources-updated', { ngoId: req.user.id });
console.log('Emitted resources-updated for NGO:', req.user.id);
    if (lowStockAlerts.length > 0) {
      io.emit('low-stock', { ngoId: req.user.id, alerts: lowStockAlerts });
    }
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve a report
export const resolveReport = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.assignedNgo?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to resolve this report' });
    }
    if (report.status !== 'accepted') {
      return res.status(400).json({ message: 'Report must be accepted first' });
    }
    report.status = 'resolved';
    await report.save();
    const io = req.app.get('io');
    io.emit('report-resolved', { reportId: report._id, victimId: report.victim, assignedNgo: report.assignedNgo });
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};