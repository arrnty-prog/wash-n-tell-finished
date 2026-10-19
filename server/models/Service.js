const mongoose = require('mongoose')

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String
    },
    pricing_type: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    sort_order: {
        type: Number,
    }
})

const ServiceModel = mongoose.model("services", ServiceSchema)

module.exports = ServiceModel