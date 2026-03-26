import mongoose from "mongoose";

const DataPointSchema = new mongoose.Schema({
  fiscalDate: String,
  numericValue: Number,
});

const ItemSchema = new mongoose.Schema({
  itemCode: Number,
  itemName: String,
  displayLevel: Number,
  data: [DataPointSchema],
});

const FinanceStatementSchema = new mongoose.Schema({
  code: String, // GMD
  name: String,
  type: Number,
  period: Number,
  year: Number,
  items: [ItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.FinanceStatement ||
  mongoose.model("FinanceStatement", FinanceStatementSchema);
