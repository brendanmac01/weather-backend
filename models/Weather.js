const mongoose = require('mongoose');

// Define the Weather schema
const weatherSchema = new mongoose.Schema({
  zip: {
    type: String,
    required: true
  },
  weatherData: {
    type: Object,
    required: true
  }
});

// Create and export the Weather model
module.exports = mongoose.model('Weather', weatherSchema);
