const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const depositmethodlistSchema = new Schema({
    depositmethodname: String,
})



module.exports = mongoose.model('DepositMethodList', depositmethodlistSchema);