const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const supplierSchema = new Schema(
  {
    name: { type: String, required: true },

    phoneNo: { type: String, required: true },

    address: { type: String },

    state: { type: String },

    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
