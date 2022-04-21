const mongoose = require('../database');

const TshirtSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    season: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }
})

const Tshirt = mongoose.model('Tshirt', TshirtSchema);
module.exports = Tshirt;