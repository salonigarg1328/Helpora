import User from '../models/User.js';
import DisasterReport from '../models/DisasterReport.js';

// @desc    Get all unverified NGOs
// @route   GET /api/admin/ngos/unverified
// @access  Private/Admin
export const getUnverifiedNgos = async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', verified: false }).select('-password');
    res.json(ngos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify an NGO
// @route   PATCH /api/admin/verify/:id
// @access  Private/Admin
export const verifyNgo = async (req, res) => {
  try {
    const ngo = await User.findById(req.params.id);
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found' });
    }
    ngo.verified = true;
    await ngo.save();
    res.json({ message: 'NGO verified successfully', ngo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const totalReports = await DisasterReport.countDocuments();
    const pendingReports = await DisasterReport.countDocuments({ status: 'pending' });
    const totalNgos = await User.countDocuments({ role: 'ngo', verified: true });
    const pendingNgos = await User.countDocuments({ role: 'ngo', verified: false });
    const totalVictims = await User.countDocuments({ role: 'victim' });

    res.json({
      totalReports,
      pendingReports,
      totalNgos,
      pendingNgos,
      totalVictims,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};