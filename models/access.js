const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const accessSchema = new mongoose.Schema({
    walletname: String
})

module.exports = mongoose.model('Access', accessSchema);