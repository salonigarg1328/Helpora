import mongoose from 'mongoose';

const disasterReportSchema = new mongoose.Schema({
  victim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  disasterType: {
    type: String,
    required: true,
    enum: ['flood', 'earthquake', 'fire', 'cyclone', 'other'],
  },
  description: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'resolved'],
    default: 'pending',
  },
  assignedNgo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  images: [String],
  isSOS: {
    type: Boolean,
    default: false,
  },
  // 👇 UPDATED: neededResources as array of objects
  neededResources: [{
    resourceType: {
      type: String,
      enum: ['food', 'water', 'medical', 'shelter', 'transport', 'other'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

disasterReportSchema.index({ location: '2dsphere' });

const DisasterReport = mongoose.model('DisasterReport', disasterReportSchema);
export default DisasterReport;