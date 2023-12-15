const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeLogSchema = new Schema(
  {
    time: { required: true, type: Date },
    pressure: { requried: true, type: Number },
    metadata: {
      sensorId: String,
      zone: String,
    },
  },
  {
    timeseries: {
      timeField: "time",
      metaField: "metadata",
      granularity: "seconds",
    },
  }
);

const TimeLog = mongoose.model("TimeLog", timeLogSchema);
module.exports = TimeLog;
