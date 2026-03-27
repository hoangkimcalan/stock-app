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

const IncomeStatementSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    type: Number, // 90 = Income Statement
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

IncomeStatementSchema.index(
  { code: 1, type: 1, year: 1, periodNum: 1 },
  { unique: true }
);

export default mongoose.models.IncomeStatement ||
  mongoose.model('IncomeStatement', IncomeStatementSchema);
