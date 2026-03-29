import mongoose from 'mongoose';

const YearlyRatioSchema = new mongoose.Schema(
  {
    year: Number,
    quarter: { type: Number, default: null }, // null = yearly

    // Du Pont Analysis (5 chỉ số)
    taxBurden: Number,
    interestBurden: Number,
    operatingMargin: Number,
    assetTurnover: Number,
    financialLeverage: Number,
    roe: Number,

    // Quốc's Formulas (3 chỉ số)
    debtToEquity: Number,
    currentRatio: Number,
    qualityRatio: Number,
  },
  { _id: false }
);

const FinancialRatiosSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
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

FinancialRatiosSchema.index({ code: 1 }, { unique: true });
FinancialRatiosSchema.index({ code: 1, 'ratios.year': 1 });
FinancialRatiosSchema.index({ sectorName: 1, 'ratios.year': 1 });

export default mongoose.models.FinancialRatios ||
  mongoose.model('FinancialRatios', FinancialRatiosSchema);
