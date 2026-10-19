const ItemModel = require('../models/Item.js');

const getItems = (req, res)=> {
    ItemModel.find()
    .then(items => res.json(items))
    .catch(err => {
        console.log(err)
        res.status(500).json({error: "Internal Server Error"})
    })
}


module.exports = {getItems};