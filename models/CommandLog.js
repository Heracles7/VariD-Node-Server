const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commandLogSchema = new Schema(
  {
    device: {
      type: Object,
    },
    type: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CommandLog = mongoose.model("CommandLog", commandLogSchema);
module.exports = CommandLog;
