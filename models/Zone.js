const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const zoneSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    command: {
        type: String
    },
    program: {
        type: String
    },
    lastCommandTime: {
        type: Date
    },
}, { timestamps: true })

const Zone = mongoose.model('Zone', zoneSchema)
module.exports = Zone