const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const logEntrySchema = new Schema ({
    device: {
        type: Object
    },
    type: {
        type: String
    },
    content {
        type: String,
        required: true
    }
}, { timestamps: true })

const LogEntry = mongoose.model('LogEntry', logEntrySchema)
module.exports = LogEntry