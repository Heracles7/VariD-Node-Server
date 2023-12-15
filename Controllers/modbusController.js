const modbus = require("modbus-stream");
const TimeLog = require('../models/TimeLog.js');
const Setting = require('../models/Setting.js');
const Bridge = require('../models/Bridge.js');
const Model = require('../models/Model.js');
const modbusSettings = Setting.findOne({ parameter: 'modbus'}).exec();

exports.readActuator = async function(req,res){

    console.log(req.params.id);
    let result = 'Chiamata di lettura attuatori con parametro: '+req.params.id;
    res.send(result);

}

exports.readById = async function (req, res) {
    console.log('Log: Chiamata di lettura attuatori con parametro: '+req.params.id);
    let result = 'Chiamata di lettura attuatori con parametro: '+req.params.id;
    res.send(result);
}
exports.readActuator = async function (actuator) {
    console.log('Log: Chiamata di lettura attuatore: '+actuator.name);

    let actuatorAddress = actuator.address
    let actuatorBridge    = await  Bridge.findById(actuator.bridge).exec();
    let actuatorModel = await Model.findById(actuator.model).exec();
    let actuatorOpenCommand = actuatorModel.read.openCommand;
    let quantity = actuatorModel.read.openCurrent - actuatorModel.read.openCommand + 1;

    modbus.tcp.connect(
        modbusSettings.port,
        actuatorBridge.address,
        {
            debug: "automaton-2454"
        },
        (err, connection) => {
            if (err) {
                throw err;
            } else {
                console.log('connected');
                connection.readHoldingRegisters({
                    actuatorOpenCommand,
                    quantity: quantity,
                    extra: { unitId: actuatorAddress }
                }, (err,resp) => {
                    if (err) throw err;

                    mydata = resp.response.data;

                    let responseCommand = mydata[0].readUInt16BE();
                    let responseReal = mydata[quantity-1].readUInt16BE();

                    mydata3 = 'GET request made. Command Apertura buffer ' + responseCommand + ' con apertura reale ' + responseReal;

                    return { responseCommand: responseCommand, responseReal:responseReal }


                });



            }

        });


    let result = 'Chiamata di lettura attuatori con parametro: '+actuator._id;
    return(result);
}
exports.readSensor = async function (actuator) {
    console.log('Log: Chiamata di lettura sensore: '+actuator.name);

    let actuatorAddress = actuator.address
    let actuatorBridge    = await  Bridge.findById(actuator.bridge).exec();
    let actuatorModel = await Model.findById(actuator.model).exec();
    let actuatorOpenCommand = actuatorModel.read.pressurePa;
    let quantity = 1;
    let responseReal = null;

    modbus.tcp.connect(
        modbusSettings.port,
        actuatorBridge.address,
        {
            debug: "automaton-2454"
        },
        (err, connection) => {
            if (err) {
                throw err;
            } else {
                console.log('connected');
                connection.readHoldingRegisters({
                    actuatorOpenCommand,
                    quantity: quantity,
                    extra: { unitId: actuatorAddress }
                }, (err,resp) => {
                    if (err) throw err;

                    mydata = resp.response.data;
                    console.log(mydata)
                    responseReal = mydata[0].readInt16BE();
                    console.log(responseReal)

                    mydata3 = 'GET request made. Sensor value ' + responseReal;



                });
            }
        });


    return { responseReal:responseReal }
}
exports.setActuator = async function (actuator, params) {
    console.log('Log: Chiamata di scrittura attuatore: '+actuator.name+' e parametro:');
    console.log(params)
    let actuatorAddress = actuator.address
    let actuatorBridge    = await  Bridge.findById(actuator.bridge).exec();
    let actuatorModel = await Model.findById(actuator.model).exec();
    let actuatorOpenCommand = actuatorModel.read.openCommand;

    modbus.tcp.connect(
        modbusSettings.port,
        actuatorBridge.address,
        {
            debug: "automaton-2454"
        },
        (err, connection) => {
            if (err) {
                throw err;
            } else {
                console.log('connected');
                let valueToWrite  = Buffer.allocUnsafe(2);
                valueToWrite.writeUInt16BE(params.command*100);  // Big endian

                connection.writeSingleRegister ({
                    actuatorOpenCommand,
                    value: valueToWrite,
                    extra: { unitId: actuatorAddress }
                }, (err,resp) => {
                    if (err) throw err;

                    let setOpenCommand2 = resp.response.value.readUInt16BE();

                    mydata3 = 'Actuator opened to: ' + setOpenCommand2;
                    console.log(mydata3);

                    return setOpenCommand2
                } );



            }

        });


    let result = 'Chiamata di lettura attuatori con parametro: '+actuator._id;
    return(result);
}
