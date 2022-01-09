const mongoose = require('mongoose');

require('dotenv').config();

const connect = () => {
    mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log(`Connection with database is successful!`);
    }).catch(() => {
        console.log(`Connection can't be made with database!`);
    });
}

module.exports = connect;