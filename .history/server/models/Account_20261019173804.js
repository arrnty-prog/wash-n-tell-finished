const mongoose = require('mongoose')

const AccountSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        trim: true
    },
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
    createdAt: {
        type: Date,
        default: Date.now
    },
    position:
    { type: String,
        trim: true }, 
    }, {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

//just for display of acccount id
AccountSchema.virtual('userCode').get(function () {
  return '#' + this._id.toString().slice(-6).toUpperCase();
});

const AccountModel = mongoose.model("accounts", AccountSchema)

module.exports = AccountModel