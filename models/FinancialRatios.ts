import mongoose from 'mongoose';

const ScoreBreakdownSchema = new mongoose.Schema(
  {
    roe: { type: String, default: null }, // "+1 ROE >= benchmark", "-1 ROE < benchmark", etc
    debtToEquity: { type: String, default: null },
    currentRatio: { type: String, default: null },
    qualityRatio: { type: String, default: null },
  },
  { _id: false }
);

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

    // Weight for weighted average calculation (Ri)
    netRevenue: Number, // Doanh thu thuần - dùng làm trọng số

    // Scoring
    score: { type: Number, default: 0 }, // Tổng điểm (có thể từ -4 đến +4)
    scoreBreakdown: ScoreBreakdownSchema, // Chi tiết điểm từng chỉ số
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
