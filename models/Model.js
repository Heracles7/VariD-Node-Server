const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const modelSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    read: {
        type: Object,
        required: true
    },
    write: {
        type: Object,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
}, { timestamps: true })

const Model = mongoose.model('Model', modelSchema)
module.exports = Model