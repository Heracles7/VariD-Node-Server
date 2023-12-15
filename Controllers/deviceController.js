const modbus = require("modbus-stream");
const TimeLog = require('../models/TimeLog.js');
const Zone = require('../models/Zone.js');
const Bridge = require('../models/Bridge.js');
const Device = require('../models/Device.js');

const modbusController = require('../Controllers/modbusController.js')


exports.setManualOverride = async function(id,perc){
    if (!String.prototype.toObjectId) {
        String.prototype.toObjectId = function() {
            let ObjectId = (require('mongoose').Types.ObjectId);
            return new ObjectId(this.toString());
        };
    }
    console.log ('Start overriding zone '+id+' to '+perc+'%');
    /*** I'm overriding the programming, directly setting the opening percentage ***/
    // set the zone command to "manual" and lastCommand to current time
    const updatedData = { command: 'manual', lastCommandTime: new Date()};
    const options = { new: true };
    try {
            const result = await Zone.findByIdAndUpdate(
                id, updatedData, options
            )
            console.log('updated zone')
            //console.log (result);
    }
    catch (e) {
            console.log('Zone '+id+' not found or not updated correctly')
            //console.log(e)
    }

    // retrieve all zone masters
    const zoneMasters = await Device.find({ zone: id.toObjectId(), type: 'actuator', master: true }).exec();
    // loop, open and store accordingly
    await Promise.all(zoneMasters.map(async (master) => {
        const setActuator = await modbusController.setActuator(master, {command: perc});
        console.log ('set the actuator with ID: '+master._id);
        console.log('Actuator successfully set to: ' + setActuator);
        // update the device with the new commanded opening
        const updatedData = { lastCommand: perc };
        const options = { new: true };
        try {
            const result = await Device.findByIdAndUpdate(
                master._id, updatedData, options
            )
            console.log('updated device')
            console.log (result);
        }
        catch (e) {
            console.log('Zone '+id+' not found or not updated correctly')
            //console.log(e)
        }
    }))

    //let's see what the sensor says...
    const zoneSensor = await Device.findOne({ zone: id.toObjectId(), type: 'sensor' }).exec();
    console.log  ('zoneSensor')
    console.log  (zoneSensor)
    const sensorValue = await modbusController.readSensor(zoneSensor);
    console.log(sensorValue)
    /*const zoneSlaves = await Device.find({ zone: id.toObjectId(), type: 'actuator', master: false }).exec();
    console.log  ('zoneSlaves')
    console.log  (zoneSlaves)*/

    // go through each and command them to open accordingly

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

}

