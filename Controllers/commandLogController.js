const CommandLog = require("../models/CommandLog");

exports.createLogEntry = async function (device, type, content) {
  const newLogEntry = new CommandLog({
    device,
    type,
    content,
  });

  try {
    await newLogEntry.save();
    console.log("Log entry created successfully");
  } catch (error) {
    console.error("Error creating log entry:", error);
  }
};
