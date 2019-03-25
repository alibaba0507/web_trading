"use strict";
// lib to use later 
/*"node-persist": "^2.1.0",
         "jade": "^1.0.4",
        "stylus": "^0.49.1",
        "nib": "^1.0.4"*/
        // for package.json
//const storage = require('node-persist');
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


// Require express and create an instance of it
var express = require('express');
var app = express();

// on the request to root (localhost:3000/)
app.get('/', function (req, res) {
    // listening for token 
    if (typeof(req.token) !== 'undefined')
    {
        store.set('token',req.token);
        res.send('<b>Token has been saved  .... ',req.token);
    }
    res.send('<b>Unknown request ....');
});


// start the server in the port 8080 !
// change the port if not working when deploy
// to server
app.listen(8080, function () {
    console.log('Example app listening on port 8080.');
});