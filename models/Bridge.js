const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const bridgeSchema = new Schema ({
    address: {
        required: true,
        type: String
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true })

const Bridge = mongoose.model('Bridge', bridgeSchema)
module.exports = Bridge