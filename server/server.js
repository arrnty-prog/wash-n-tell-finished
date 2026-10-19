const express = require ("express")
const mongoose = require ('mongoose')
const cors = require('cors')
const app = express();

const accountRoutes = require('./routes/AccountRoutes')
const serviceRoutes = require('./routes/ServiceRoutes')
const itemRoutes = require('./routes/ItemRoutes.js')
const orderRoutes = require('./routes/OrderRoutes')

mongoose.connect('mongodb://localhost:27017/WashNTell')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/', accountRoutes);
app.use('/services', serviceRoutes);
app.use('/items', itemRoutes);
app.use('/orders', orderRoutes);
app.use('/audit-logs', require('./routes/AuditRoutes'));
app.use('/inventory', require('./routes/InventoryRoutes'));

app.listen(8000, () => {
    console.log(`Server is running at http://localhost:8000`)
})