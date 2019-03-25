"use strict";
const scatteredStore = require('scattered-store');

const store = scatteredStore.create('persist', (err) => {
    // This is optional callback function so you can know
    // when the initialization is done.
    if (err) {
      // Oops! Something went wrong.
      console.log(" ##### Error Init cattered-store ", err);
    } else {
      // Initialization done!
    }
  });

  var config = {};

  config.token = ""; // get this from http://tradingstation.fxcm.com/
  config.trading_api_host = 'api.fxcm.com';
  config.trading_api_port = 443;
  config.trading_api_proto = 'https'; // http or https
  
  module.exports.config = config;

  module.exports.store = store;