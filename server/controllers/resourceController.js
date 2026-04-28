import Resource from '../models/Resource.js';

// @desc    Get logged‑in NGO's resources
// @route   GET /api/resources/me
// @access  Private (NGO only)
export const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ ngo: req.user.id });
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a new resource (or update if exists)
// @route   POST /api/resources
// @access  Private (NGO only)
export const addResource = async (req, res) => {
  try {
    const { resourceType, quantity, unit } = req.body;

    // Check if resource already exists for this NGO
    let resource = await Resource.findOne({ ngo: req.user.id, resourceType });

    if (resource) {
      // Update existing
      resource.quantity = quantity;
      resource.unit = unit || resource.unit;
      resource.lastUpdated = Date.now();
      await resource.save();
    } else {
      // Create new
      resource = new Resource({
        ngo: req.user.id,
        resourceType,
        quantity,
        unit: unit || 'units',
      });
      await resource.save();
    }

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a specific resource
// @route   PUT /api/resources/:id
// @access  Private (NGO only)
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, ngo: req.user.id });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const { quantity, unit } = req.body;
    if (quantity !== undefined) resource.quantity = quantity;
    if (unit !== undefined) resource.unit = unit;
    resource.lastUpdated = Date.now();

    await resource.save();
    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (NGO only)
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, ngo: req.user.id });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};