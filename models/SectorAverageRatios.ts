import mongoose from 'mongoose';

const YearlyRatioSchema = new mongoose.Schema(
  {
    year: Number,
    quarter: { type: Number, default: null },

    // Du Pont Analysis
    taxBurden: Number,
    interestBurden: Number,
    operatingMargin: Number,
    assetTurnover: Number,
    financialLeverage: Number,
    roe: Number,

    // Quốc's Formulas
    debtToEquity: Number,
    currentRatio: Number,
    qualityRatio: Number,

    // Metadata
    companyCount: Number,
  },
  { _id: false }
);

const SectorAverageRatiosSchema = new mongoose.Schema(
  {
    sectorName: String,
    ratios: [YearlyRatioSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

SectorAverageRatiosSchema.index({ sectorName: 1 }, { unique: true });
SectorAverageRatiosSchema.index({ sectorName: 1, 'ratios.year': 1 });

export default mongoose.models.SectorAverageRatios ||
  mongoose.model('SectorAverageRatios', SectorAverageRatiosSchema);
