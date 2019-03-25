"use strict";
// lib to use later 
/*"node-persist": "^2.1.0",
         "jade": "^1.0.4",
        "stylus": "^0.49.1",
        "nib": "^1.0.4"*/
        // for package.json
//const storage = require('node-persist');

var store = require('./repository');
var cli = require('./client');

async function getToken()
{
    const token = await store.get('token');
    console.log(" $$$$$$ Funct getToekn " ,token);
    return token;
}

//console.log(" ##### Token ",getToken());
// Require express and create an instance of it
var express = require('express');
var app = express();
var token;
// on the request to root (localhost:3000/)
app.get('/', function (req, res) {
    // listening for token 
 
    if (typeof(req.query.token) !== 'undefined')
    {
        store.store.set('token',req.query.token);
        cli.get_model((respId,reqId,data)=>{
           res.send('<b>RespId : ' + respId + 
              '</b></br><b> reqId : ' + reqId 
               + '</b></br>' + data);
        });
       /* store.store.get('token')
            .then((value) => {
                //console.log(value); // Hello World!
                res.send('<b>Token has been saved as pooling from repository  .... ' + value);
                });
                */
        
    }else
        res.send('<b>Unknown request ....');
});


// start the server in the port 8080 !
// change the port if not working when deploy
// to server
app.listen(8080, function () {
    console.log('Example app listening on port 8080.');
});