const ServiceModel = require('../models/Service.js');

const getServices = (req, res)=> {
    ServiceModel.find()
    .then(services => res.json(services))
    .catch(err => {
        console.log(err)
        res.status(500).json({error: "Internal Server Error"})
    })
}


module.exports = {getServices};