const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    cats: [{type: mongoose.Schema.Types.ObjectId, ref: 'Cat'}]
})

const User = mongoose.model('User', userSchema);

module.exports = User;