"use strict";
//const storage = require('node-persist');
const store = require('scattered-store');
/*
 await storage.init({
	dir: 'persist',

	stringify: JSON.stringify,

	parse: JSON.parse,

	encoding: 'utf8',

	logging: false,  // can also be custom logging function

	ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS or a valid Javascript Date object

	expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache

    // in some cases, you (or some other service) might add non-valid storage files to your
    // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
    forgiveParseErrors: false

});
*/
var currencyMap = new Map();
var ordersMap = new Map();

const store = scatteredStore.create('persist', (err) => {
    // This is optional callback function so you can know
    // when the initialization is done.
    if (err) {
      // Oops! Something went wrong.
    } else {
      // Initialization done!
    }
  });

  
function get_model(tradeReqAsStr)
{
 var data = JSON.parse(tradeReqAsStr);
 var buyLots,sellLots;
 /**
   "open_positions":[{"t":1,"ratePrecision":5
    ,"tradeId":"122743073","accountName":"01027808","accou
   ntId":"1027808","roll":0,"com":5,"open":1.19719
   ,"valueDate":"","grossPL":1.74,"close":1.19632
   ,"visiblePL":8.7,"isDisabled":false
   ,"currency":"EUR/USD","isBuy":false,"amountK":2
   ,"currencyPoint":0.2,"time":"09152017143932","usedMargin":52
   ,"stop":0,"stopMove":0,"limit":0}]
  */
 if (typeof(data.open_positions) !== 'undefined')
 {
   var open_positions = data.open_positions.sort((a,b)=>
        (a.currency > b.currency)?1 : 
        (a.currency == b.currency) 
         ? ((a.grossPL > b.grossPL) ? 1 : -1):-1 );
    for (item in open_positions)
    {
        var o = currencyMap.get(item.currency);
        if (typeof(o) === 'undefined')
        {
            o = {buy:0,sell:0,buyLots:0,sellLots:0};
        }
        if (item.isBuy)
        {
            o.buyLots = Number(o.buyLots) + Number(item.amountK);
            o.buy = Number(o.buy) + Number(item.grossPL);
        }else 
        {
            o.sellLots = Number(o.sellLots) + Number(item.amountK);
            o.sell = Number(o.sell) + Number(item.grossPL);
        }
        currencyMap.set(item.currency,o);
    } // end for
    
 }// end if (typeof(data.open_positions) !== 'undefined') 
 
}