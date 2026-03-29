import mongoose from 'mongoose';

const DataPointSchema = new mongoose.Schema(
  {
    itemCode: Number,
    fiscalDate: String,
    numericValue: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const ItemSchema = new mongoose.Schema(
  {
    itemCode: Number,
    itemName: String,
    displayLevel: Number,
    data: [DataPointSchema],
  },
  { _id: false }
);

const CashFlowStatementSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    sectorName: String,
    type: Number, // 91
    period: Number,
    year: Number,
    periodNum: Number,
    label: [String],
    rawItems: [ItemSchema],
    tree: [ItemSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

CashFlowStatementSchema.index(
  { code: 1, type: 1, year: 1, periodNum: 1 },
  { unique: true }
);

export default mongoose.models.CashFlowStatement ||
  mongoose.model('CashFlowStatement', CashFlowStatementSchema);
