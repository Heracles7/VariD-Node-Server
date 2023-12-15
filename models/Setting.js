const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const settingSchema = new Schema(
  {
    parameter: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
    port: {
      type: Number,
    },
    heating: {
      type: Number,
    },
    neutral: {
      type: Number,
    },
    cooling: {
      type: Number,
    },
    unit: {
      type: String,
    },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);
module.exports = Setting;
