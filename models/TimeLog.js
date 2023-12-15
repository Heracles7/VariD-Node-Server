const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const timeLogSchema = Schema(
    {
        time: Date,
        pressure: Number,
        metadata: {
            sensorId: String,
            zone: String,
        },
    },
    {
        timeseries: {
            timeField: 'time',
                metaField: 'metadata',
                granularity: 'seconds',
        },
    }
);

const TimeLog = mongoose.model('TimeLog', timeLogSchema)
module.exports = TimeLog