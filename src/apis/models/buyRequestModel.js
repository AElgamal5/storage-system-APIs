const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const buyRequestSchema = new Schema(
  {
    name: { type: String, required: true },

    details: { type: String },

    //Not approved || Approved || Delivered
    history: [
      {
        state: { type: String },
        date: { type: Date },
      },
    ],

    materials: [
      {
        id: { type: mongoose.Types.ObjectId, ref: "Material" },
        quantity: { type: Number },
        supplier: { type: mongoose.Types.ObjectId, ref: "Supplier" },
        price: { type: Number },
        done: { type: Boolean, default: false },
      },
    ],

    custodies: [
      {
        id: { type: mongoose.Types.ObjectId, ref: "Custody" },
        quantity: { type: Number },
        supplier: { type: mongoose.Types.ObjectId, ref: "Supplier" },
        price: { type: Number },
        done: { type: Boolean, default: false },
      },
    ],

    image: { type: mongoose.Types.ObjectId, ref: "Image" },

    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuyRequest", buyRequestSchema);
