"use strict";
var store = require('./repository');
var cron = require('node-cron');

var cli = require('./client');

let nodemailer = require("nodemailer");

cron.schedule('* * * * *', () => {
    //console.log('running a task every minute');
    cli.get_model((respId,reqId,data)=>{
        try {
            var jsonObj = JSON.parse(data);  
            if (typeof(jsonObj.summary) !== 'undefined')
            { 
             
             store.store.get('summary')
              .then((value) => {
                  if (typeof(value) !== 'undefined')
                  {
                     var oldSumary = JSON.parse(value);
                     oldSumary = oldSumary.sort(function(a, b) {
                         return (a.currency > b.currency) ? 1 
                                : ((a.currency < b.currency) ? -1 : 0);
                        });
                        jsonObj = jsonObj.sort(function(a, b) {
                            return (a.currency > b.currency) ? 1 
                                   : ((a.currency < b.currency) ? -1 : 0);
                           });
                    jsonObj.array.forEach(element => {
                        var result = oldSumary.find(item => {
                            return item.currency == element.currency
                         });
                         // if not exist change is true
                         // if exist and buyLots != buyLots || sellLots != sellLots
                         // || MathMax(netPL,netPL) - MathMin(netPL,netPL) > $10
                         // then change is true write new and old value
                    });
                     // todo search json Object by parameters

                    // update store with new data  
                    store.store.set('summary',JSON.stringify(jsonObj.summary));
                  }else // update parsitend summary 
                   store.store.set('summary',JSON.stringify(jsonObj.summary));
              });
            }  
        } catch (e) {
            console.error(e);
        }
        
        
     });
  });
