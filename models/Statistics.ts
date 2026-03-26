import mongoose from 'mongoose';

const DataPointSchema = new mongoose.Schema(
  {
    year: Number,
    value: Number,
    value2: Number,
  },
  { _id: false }
);

const StatisticsItemSchema = new mongoose.Schema(
  {
    itemCode: String,
    itemName: String,
    displayLevel: Number,
    data: [DataPointSchema],
  },
  { _id: false }
);

const StatisticsDataGroupSchema = new mongoose.Schema(
  {
    data: [StatisticsItemSchema],
    label: [Number],
  },
  { _id: false }
);

const StatisticsSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    floor: String,
    bvps: Number,
    eps: Number,
    klcplh: Number,
    marketCapital: Number,
    pb: Number,
    pe: Number,
    roaa: Number,
    roea: String,
    adChange: Number,
    adClose: Number,
    ceilingPrice: Number,
    floorPrice: Number,
    pctChange: Number,
    epsRating: Number,
    rsRating: String,
    rsnRating: String,
    sectorName: String,
    smrRating: String,
    data: [StatisticsDataGroupSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

StatisticsSchema.index({ code: 1 }, { unique: true });

export default mongoose.models.Statistics ||
  mongoose.model('Statistics', StatisticsSchema);
