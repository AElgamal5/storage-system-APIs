const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const stageSchema = new Schema(
  {
    name: { type: String, required: true },

    code: { type: String, required: true },

    type: { type: String },

    rate: { type: Number },

    price: { type: Number },

    image: { type: String },

    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stage", stageSchema);