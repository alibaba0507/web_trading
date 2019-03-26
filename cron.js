"use strict";
var store = require('./repository');
var cron = require('node-cron');

var cli = require('./client');

let nodemailer = require("nodemailer");

cron.schedule('* * * * *', () => {
    //console.log('running a task every minute');
    updateShedule();
  });

  var updateShedule = () =>
  {
    cli.get_model((respId,reqId,data)=>{
        try {
            var jsonObj = JSON.parse(data);  
            if (typeof(jsonObj.summary) !== 'undefined')
            { 
             // get the saved data from store
             store.store.get('summary')
              .then((value) => {
                var modifiedElements = [];
                  if (typeof(value) !== 'undefined')
                  { // we have entry on a store for summary
                     var oldSumary = JSON.parse(value);
                    jsonObj.array.forEach(element => {
                        var result = oldSumary.find(item => {
                            return ((item.currency == element.currency)
                                && (item.amountK !== element.amountK
                                     || (Math.max(Number(item.netPL),Number(element.netPL))
                                             -Math.min(Number(item.netPL),Number(element.netPL)) 
                                               > 10 )));
                           // return item.currency == element.currency;
                         });
                         // if not exist change is true
                         // if exist and buyLots != buyLots || sellLots != sellLots
                         // || MathMax(netPL,netPL) - MathMin(netPL,netPL) > $10
                         // then change is true write new and old value
                    });
                     // todo search json Object by parameters

                    // update store with new data  
                    store.store.set('summary',JSON.stringify(jsonObj.summary));
                  }else // update parsitend store summary 
                   store.store.set('summary',JSON.stringify(jsonObj.summary));
              });
            }  
        } catch (e) {
            console.error(e);
        }
        
        
     });
  }
