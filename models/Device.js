const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const deviceSchema = new Schema ({
    bridge: {
        type: Object,
        required: true
    },
    address: {
        type: Number,
        required: true
    },
    type: {
        required: true,
        type: String
    },
    model: {
        type: Object,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    line: {
        type: String
    },
    description: {
        type: String
    },
    zone: {
        type: Object
    },
    master: {
        type: Boolean
    },
    lastRead: {
        type: Number
    },
    lastCommand: {
        type: Number
    }
}, { timestamps: true })

const Device = mongoose.model('Device', deviceSchema)
module.exports = Device