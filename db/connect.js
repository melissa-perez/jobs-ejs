const mongoose = require('mongoose');

const connectDB = (url) => {
  return mongoose.connect(url).then(() => console.log("Connection to database established...")).catch((err) => {
    console.log(err);
  });
};

module.exports = connectDB;
