const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/project');

mongoose.Promise = global.Promise;

//require('../controlers/index')(app);

module.exports = mongoose;