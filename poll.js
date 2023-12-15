const Device = require("./models/Device");
const TimeLog = require("./models/TimeLog");
const modbusController = require("./Controllers/modbusController");

exports.pollDevices = async function () {
  console.log("polling!:");
  const devices = await Device.find({ type: "sensor" }); // Assuming you want to poll sensors
  console.log(devices);
  for (const device of devices) {
    let sensorData = await modbusController.readSensor(device);
    let timeLogEntry = new TimeLog({
      time: new Date(),
      pressure: sensorData.responseReal, // assuming this is the pressure data
      metadata: {
        sensorId: device._id,
        zone: device.zone,
      },
    });
    try {
      await timeLogEntry.save();
      TimeLog.find({}).then((res) => console.log(res));
    } catch (e) {
      console.log(e);
    }
  }
  // TimeLog.find({}).then((res) => console.log(res));
};
