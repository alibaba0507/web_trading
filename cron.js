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
                    var recordModified = '';
                    var oldSumary = JSON.parse(value);
                    jsonObj.summary.forEach(element => {
                        var result = oldSumary.find(item => {
                            return ((item.currency == element.currency)
                                && (Number(item.amountK) !== Number(element.amountK)
                                     || (Math.max(Number(item.netPL),Number(element.netPL))
                                             -Math.min(Number(item.netPL),Number(element.netPL)) 
                                               > 10 )));
                           // return item.currency == element.currency;
                         });
                         if (typeof(result) !== 'undefined')
                         {
                             recordModified = true;
                             var elements = [];
                             // new one
                             elements.push(element);
                             // old one
                             elements.push(result);
                             modifiedElements.push(elements);

                         }
                         // if not exist change is true
                         // if exist and buyLots != buyLots || sellLots != sellLots
                         // || MathMax(netPL,netPL) - MathMin(netPL,netPL) > $10
                         // then change is true write new and old value
                    });
                     // todo search json Object by parameters

                    // update store with new data
                    if (recordModified == true)  
                        store.store.set('summary',JSON.stringify(jsonObj.summary));
                  }else // update parsitend store summary 
                   store.store.set('summary',JSON.stringify(jsonObj.summary));
                  updateNotification(jsonObj,modifiedElements);
              });
            }  
        } catch (e) {
            console.error(e);
        }
        
        
     });
  };

  var  updateNotification = (jsonObj,modifiedElements)=> 
  {
      try{
          var emailHTML = '';
          var openPosition = jsonObj.OpenPosition;
           if (typeof(openPosition) !== 'undefined')
            { // sort by currency && price
                openPosition = openPosition.sort((a,b)=>{
                return(a.currency < b.currency
                        ? 1 : ((a.currency == b.currency)
                             ?((a.grossPL > b.grossPL)?1:0):-1));
              });
            }

            var order = jsonObj.Order;
            if (typeof(order) !== 'undefined')
             { // sort by currency && price
                order = order.sort((a,b)=>{
                 return(a.currency < b.currency
                         ? 1 : ((a.currency == b.currency)
                              ?0:-1));
               });
             }
             modifiedElements.forEach(element =>
              {
               var newSumary = element[0];
               var oldSumary = element[1];
               emailHTML += '<tr><td>' + newSumary.currency  
                          + '</td>' + '<td>' + newSumary.amountKSell 
                          + '</td><td>' + newSumary.amountKBuy
                          + '</td><td><b><font color=' 
                            + ((Number(newSumary.amountK) >= 0) ? '"green">':'"red">') 
                            + newSumary.amountK 
                            + '</font></b>(' + oldSumary.amountK + ')'
                            + '</td><td><b><font color=' 
                            + ((Number(newSumary.netPL) > Number(oldSumary.netPL))
                              ? '"green">':'"red">')
                             + newSumary.netPL 
                            + '</font></b>(' + oldSumary.netPL + ')'
                            + '</td></tr>';
                             
             });

          
  
      }catch(e)
      {
          console.log(e);
      }
  };
