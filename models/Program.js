const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const programSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    based: {
        type: String
    },
    pressure: {
        type: Number
    },
    custom: {
        type: Boolean
    },
    cooling: {
        type: Number
    },
    neutral: {
        type: Number
    },
    heating: {
        type: Number
    }
}, { timestamps: true })

const Program = mongoose.model('Program', programSchema)
module.exports = Program