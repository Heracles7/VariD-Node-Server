const modbus = require("modbus-stream");
const TimeLog = require("../models/TimeLog.js");
const Setting = require("../models/Setting.js");
const Bridge = require("../models/Bridge.js");
const Model = require("../models/Model.js");
const Device = require("../models/Device.js");

const commandLogController = require("../Controllers/commandLogController.js");

function connectModbusTcp(address, port, options) {
  return new Promise((resolve, reject) => {
    modbus.tcp.connect(port, address, options, (err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}

exports.readActuator = async function (req, res) {
  console.log(req.params.id);
  let result = "Chiamata di lettura attuatori con parametro: " + req.params.id;
  res.send(result);
};

exports.readById = async function (req, res) {
  console.log(
    "Log: Chiamata di lettura attuatori con parametro: " + req.params.id
  );
  let result = "Chiamata di lettura attuatori con parametro: " + req.params.id;
  res.send(result);
};
exports.readActuator = async function (actuator) {
  console.log("Log: Chiamata di lettura attuatore: " + actuator.name);

  const modbusSettings = await Setting.findOne({ parameter: "modbus" }).exec();
  let actuatorAddress = actuator.address;
  let actuatorBridge = await Bridge.findById(actuator.bridge).exec();
  let actuatorModel = await Model.findById(actuator.model).exec();
  let actuatorOpenCommand = actuatorModel.read.openCommand;
  let quantity =
    actuatorModel.read.openCurrent - actuatorModel.read.openCommand + 1;
  let responseCommand = null;
  let responseReal = null;
  console.log("address:", actuatorBridge.address);
  if (modbusSettings) {
    console.log(modbusSettings.port);
  } else {
    console.log("modbusSettings not found");
  }

  try {
    const connection = await connectModbusTcp(
      actuatorBridge.address,
      modbusSettings.port,
      {
        debug: null,
        retries: 5,
        retry: 300,
      }
    );

    console.log("connected");
    console.log("address", actuatorOpenCommand);
    console.log("quantity", quantity);
    console.log("extra", actuatorAddress);

    const resp = await new Promise((resolve, reject) => {
      connection.readHoldingRegisters(
        {
          address: actuatorOpenCommand - 40001,
          quantity: quantity,
          extra: { unitId: actuatorAddress },
        },
        (err, resp) => {
          if (err) {
            reject(err);
          } else {
            resolve(resp);
          }
        }
      );
    });

    let mydata = resp.response.data;
    console.log(mydata);
    responseCommand = mydata[0].readUInt16BE();
    responseReal = Math.round(mydata[quantity - 1].readUInt16BE() / 100);

    console.log(
      `GET request made. Command Apertura buffer ${responseCommand} con apertura reale ${responseReal}`
    );

    const updatedData = { lastRead: responseReal };
    const options = { new: true };
    const result = await Device.findByIdAndUpdate(
      actuator._id,
      updatedData,
      options
    );
    console.log("updated lastRead on actuator");
    console.log(result);
    await commandLogController.createLogEntry(
      actuator._id,
      "Read Actuator",
      `Command Apertura buffer ${responseCommand} con apertura reale ${responseReal}`
    );
  } catch (e) {
    console.error("Error in reading actuator: ", e);
    await commandLogController.createLogEntry(
      actuator._id,
      "Read Actuator Error",
      e.message
    );
  }

  let result = { responseCommand: responseCommand, responseReal: responseReal };
  return result;
};
exports.readSensor = async function (actuator) {
  console.log("Log: Chiamata di lettura sensore: " + actuator.name);

  const modbusSettings = await Setting.findOne({ parameter: "modbus" });
  let actuatorAddress = actuator.address;
  let actuatorBridge = await Bridge.findById(actuator.bridge).exec();
  let actuatorModel = await Model.findById(actuator.model).exec();
  let actuatorReadCommand = actuatorModel.read.pressurePa;
  let quantity = 1;
  let responseReal = null;

  try {
    const connection = await connectModbusTcp(
      actuatorBridge.address,
      modbusSettings.port,
      {
        debug: "automaton-2454",
      }
    );

    console.log("connected");

    const resp = await new Promise((resolve, reject) => {
      connection.readHoldingRegisters(
        {
          address: actuatorReadCommand - 40001, // Adjust if needed
          quantity: quantity,
          extra: { unitId: actuatorAddress },
        },
        (err, resp) => {
          if (err) {
            reject(err);
          } else {
            resolve(resp);
          }
        }
      );
    });

    let mydata = resp.response.data;
    console.log("sensor's mydata");
    console.log(mydata);
    responseReal = mydata[0].readInt16BE();
    console.log("GET request made. Sensor value " + responseReal);

    const updatedData = { lastRead: responseReal };
    const options = { new: true };
    const result = await Device.findByIdAndUpdate(
      actuator._id,
      updatedData,
      options
    );
    console.log("updated lastRead on sensor");
    console.log(result);
    await commandLogController.createLogEntry(
      actuator._id,
      "Read Sensor",
      "Sensor value " + responseReal
    );
  } catch (e) {
    console.error("Error in reading sensor: ", e);
    await commandLogController.createLogEntry(
      actuator._id,
      "Read Sensor Error",
      e.message
    );
  }

  return { responseReal: responseReal };
};

exports.setActuator = async function (actuator, params) {
  console.log(
    "Log: Chiamata di scrittura attuatore: " + actuator.name + " e parametro:"
  );
  console.log(params);

  const modbusSettings = await Setting.findOne({ parameter: "modbus" });
  let actuatorAddress = actuator.address;
  let actuatorBridge = await Bridge.findById(actuator.bridge).exec();
  let actuatorModel = await Model.findById(actuator.model).exec();
  let actuatorOpenCommand = actuatorModel.read.openCommand;
  let setOpenCommand2 = null;

  try {
    const connection = await connectModbusTcp(
      actuatorBridge.address,
      modbusSettings.port,
      {
        debug: "automaton-2454",
      }
    );

    console.log("connected");

    let valueToWrite = Buffer.allocUnsafe(2);
    valueToWrite.writeUInt16BE(params.command * 100); // Big endian

    const resp = await new Promise((resolve, reject) => {
      connection.writeSingleRegister(
        {
          address: actuatorOpenCommand - 40001,
          value: valueToWrite,
          extra: { unitId: actuatorAddress },
        },
        (err, resp) => {
          if (err) {
            reject(err);
          } else {
            resolve(resp);
          }
        }
      );
    });

    setOpenCommand2 = resp.response.value.readUInt16BE();
    console.log("Actuator opened to: " + setOpenCommand2);
    await commandLogController.createLogEntry(
      actuator._id,
      "Set Actuator",
      "Actuator opened to: " + setOpenCommand2
    );
  } catch (e) {
    console.error("Error in setting actuator: ", e);
    await commandLogController.createLogEntry(
      actuator._id,
      "Read Actuator Error",
      e.message
    );
  }

  return { setOpenCommand2: setOpenCommand2 };
};
