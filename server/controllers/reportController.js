import DisasterReport from '../models/DisasterReport.js';

// @desc    Create a new disaster report (or SOS)
// @route   POST /api/reports
// @access  Private (Victim only)
export const createReport = async (req, res) => {
  try {
    const { disasterType, description, location, urgencyLevel, images, isSOS } = req.body;

    // Validate required fields
    if (!disasterType || !location || !location.coordinates) {
      return res.status(400).json({ message: 'Missing required fields: disasterType and location' });
    }

    // If SOS, override urgency to critical
    const finalUrgency = isSOS ? 'critical' : (urgencyLevel || 'medium');

    const report = new DisasterReport({
      victim: req.user.id, // from auth middleware
      disasterType,
      description,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      urgencyLevel: finalUrgency,
      images: images || [],
      isSOS: isSOS || false,
    });

    await report.save();

    // TODO: Emit real-time notification via Socket.io (Phase 4)

    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get nearby reports for NGO (within radius)
// @route   GET /api/reports/nearby?lat=...&lng=...&radius=...
// @access  Private (NGO only)
export const getNearbyReports = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in kilometers

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Convert radius from km to meters (MongoDB uses meters)
    const radiusInMeters = radius * 1000;

    const reports = await DisasterReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
      status: 'pending', // Only show pending reports
    }).populate('victim', 'name phone'); // Optionally populate victim details

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept a report (assign to NGO)
// @route   PATCH /api/reports/:id/accept
// @access  Private (NGO only)
export const acceptReport = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({ message: 'Report already accepted or resolved' });
    }

    // Assign this NGO to the report
    report.assignedNgo = req.user.id;
    report.status = 'accepted';
    await report.save();

    // TODO: Notify victim via Socket.io

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resolve a report
// @route   PATCH /api/reports/:id/resolve
// @access  Private (Assigned NGO or Admin)
export const resolveReport = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is assigned NGO or admin
    if (report.assignedNgo?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to resolve this report' });
    }

    if (report.status !== 'accepted') {
      return res.status(400).json({ message: 'Report must be accepted first' });
    }

    report.status = 'resolved';
    await report.save();

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};