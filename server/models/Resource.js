import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['food', 'water', 'medical', 'shelter', 'transport', 'other'],
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    default: 'units',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;