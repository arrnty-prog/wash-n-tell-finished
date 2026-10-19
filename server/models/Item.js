const mongoose = require('mongoose')

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    prices:{
        dry_clean: {type: Number, required: true},
        iron: {type: Number, required: true},
        wash_and_iron: {type: Number, required: true},
    },
    icon:{
        type: String,
        required: true
    }
})

const ItemModel = mongoose.model("items", ItemSchema)

module.exports = ItemModel