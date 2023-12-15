const modbus = require("modbus-stream");
const TimeLog = require("../models/TimeLog.js");
const Zone = require("../models/Zone.js");
const Bridge = require("../models/Bridge.js");
const Device = require("../models/Device.js");

const modbusController = require("../Controllers/modbusController.js");
const commandLogController = require("../Controllers/commandLogController.js");

exports.setManualOverride = async function (id, perc) {
  let masterDelta = 0; //that's the delta between the current opening and desired one, to determine the direction
  if (!String.prototype.toObjectId) {
    String.prototype.toObjectId = function () {
      let ObjectId = require("mongoose").Types.ObjectId;
      return new ObjectId(this.toString());
    };
  }
  console.log("Start overriding zone " + id + " to " + perc + "%");
  /*** I'm overriding the programming, directly setting the opening percentage ***/
  // set the zone command to "manual" and lastCommand to current time
  const updatedData = { command: "manual", lastCommandTime: new Date() };
  const options = { new: true };
  try {
    const result = await Zone.findByIdAndUpdate(id, updatedData, options);
    console.log("updated zone");
    //console.log (result);
  } catch (e) {
    console.log("Zone " + id + " not found or not updated correctly");
    //console.log(e)
  }

  // retrieve all zone masters
  const zoneMasters = await Device.find({
    zone: id.toObjectId(),
    type: "actuator",
    master: true,
  }).exec();
  // loop, open and store accordingly
  await Promise.all(
    zoneMasters.map(async (master) => {
      const readActuator = await modbusController.readActuator(master);
      //const setActuator = await modbusController.setActuator(master, {command: perc});
      //console.log ('set the actuator with ID: '+master._id);
      console.log("actuator real opening is: " + readActuator.responseReal);
      //console.log('Actuator successfully set to: ' + setActuator);
      // update the device with the new commanded opening
      const updatedData = { lastCommand: perc };
      const options = { new: true };
      try {
        const result = await Device.findByIdAndUpdate(
          master._id,
          updatedData,
          options
        );
        console.log("updated device");
        console.log(result);
        masterDelta = result.lastRead - perc; //negative if it is opening
        console.log("Master Delta: " + masterDelta);
      } catch (e) {
        console.log("Zone " + id + " not found or not updated correctly");
        //console.log(e)
      }
    })
  );

  //let's see what the sensor says...
  const zoneSensor = await Device.findOne({
    zone: id.toObjectId(),
    type: "sensor",
  }).exec();
  console.log("zoneSensor");
  console.log(zoneSensor);
  const sensorValue = await modbusController.readSensor(zoneSensor);
  console.log("sensorValue:");
  console.log(sensorValue);
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
  console.log("after sleep");
  let zoneSensorUpd = null;
  try {
    zoneSensorUpd = await Device.findById(zoneSensor._id);
    console.log("updated lastRead on sensor");
    console.log(zoneSensorUpd);
  } catch (e) {
    console.log("Zone " + id + " not found or not updated correctly");
    //console.log(e)
  }
  let zoneMasterUpd = null;
  try {
    zoneMasterUpd = await Device.findById(zoneSensor._id);
    console.log("updated lastRead on sensor");
    console.log(zoneSensorUpd);
  } catch (e) {
    console.log("Zone " + id + " not found or not updated correctly");
    //console.log(e)
  }
  console.log("sensorValue: " + zoneSensorUpd.lastRead);
  const zoneSlaves = await Device.find({
    zone: id.toObjectId(),
    type: "actuator",
    master: false,
  }).exec();
  console.log("zoneSlaves");
  console.log(zoneSlaves);
  // loop, start to move and store  according to masterDelta
  await Promise.all(
    zoneSlaves.map(async (slave) => {
      const slaveDelta = 0;
      const readActuator = await modbusController.readActuator(slave);
      console.log("readSlave");
      console.log(readActuator);
      if (masterDelta < 0) {
      } else if (masterDelta > 0) {
      }
      //const setActuator = await modbusController.setActuator(master, {command: perc});
      //console.log ('set the actuator with ID: '+master._id);
      console.log("actuator real opening is: " + readActuator.responseReal);
      //console.log('Actuator successfully set to: ' + setActuator);
      // update the device with the new commanded opening
      const updatedData = { lastCommand: perc };
      const options = { new: true };
      try {
        const result = await Device.findByIdAndUpdate(
          master._id,
          updatedData,
          options
        );
        console.log("updated device");
        console.log(result);
        masterDelta = result.lastRead - perc; //negative if it is opening
        console.log("Master Delta: " + masterDelta);
      } catch (e) {
        console.log("Zone " + id + " not found or not updated correctly");
        //console.log(e)
      }
    })
  );

  // get all the lines from the zone
  /*const data = new Zone({
        address: req.body.address,
        name: req.body.name,
        ambient: req.body.ambient,
        description: req.body.description
    })
    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }*/
  //return json({message: 'zone' + id + 'manual override to '+perc+'%'});

  try {
    // Create log entry for successful command execution
    await commandLogController.createLogEntry(
      { id },
      "Manual Override",
      `Set to ${perc}% successfully`
    );
  } catch (error) {
    // Create log entry for failed command execution
    await commandLogController.createLogEntry(
      { id },
      "Manual Override Error",
      error.message
    );
  }
};
