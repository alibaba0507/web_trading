"use strict";

var store = require('./repository');

var io = require('socket.io-client');
var socket;
var querystring = require('querystring');
var tradinghttp = require(store.config.trading_api_proto);
var globalRequestID = 1;
var request_headers = {
	'User-Agent': 'request',
	'Accept': 'application/json',
	'Content-Type': 'application/x-www-form-urlencoded'
}
var get_model = (callback) =>
{
    store.store.get('token')
    .then((value) => {
        console.log(" ----- After get Token FROM REPOSITORY ....."); // Hello World!
				store.config.token = value;
				//'{ "method":"GET", "resource":"/trading/get_model", "params": { "models":["Offer","OpenPosition","ClosedPosition","Order","Account", "Summary","LeverageProfile","Properties"] } }'
				//'{ "method":"GET", "resource":"/trading/get_model", "params": { "models":["Offer"] } }'
				//'{ "method":"GET", "resource":"/trading/get_model", "params": { "models":["OpenPosition",] } }'
				//'{ "method":"GET", "resource":"/trading/get_model", "params": { "models":["ClosedPosition"] } }'
				//'{ "method":"GET", "resource":"/trading/get_model", "params": { "models":["Order"] } }'
				//'{ "method":"GET", "resource":"/trading/get_model", "params": { "models":["Account"] } }'
				//'{ "method":"GET", "resource":"/trading/get_model", "params": { "models":[ "Summary"] } }'
				//'{ "method":"GET", "resource":"/trading/get_model", "params": { "models":["LeverageProfile","Properties"] } }'
				//'{ "method":"GET", "resource":"/candles/1/m1", "params": { "num":10 } }'

        authenticate ( '{ "method":"GET", "resource":"/trading/get_model", "params": { "models":[ "OpenPosition","ClosedPosition","Order","Account", "Summary"] } }',callback);
        });
};


// FXCM REST API requires socket.io connection to be open for requests to be processed
// id of this connection is part of the Bearer authorization
var authenticate = (command,callback) => {
   
	console.log(" @@@@ Before Calling Socket Auth ",store.config.token);
	console.log(" @@@@ Before Calling Socket Auth Host ",store.config.trading_api_proto + '://' + store.config.trading_api_host + ':' + store.config.trading_api_port);
	//console.log(" @@@@ Before Calling Socket Auth Port ",store.config.trading_api_port);
	socket = io(store.config.trading_api_proto + '://' + store.config.trading_api_host + ':' + store.config.trading_api_port, {
			query: querystring.stringify({
				access_token: store.config.token
			})
		});
    console.log(" @@@@ AFTERe Calling Socket Auth ",store.config.token);
	// fired when socket.io connects with no errors
	socket.on('connect', () => {
		console.log('Socket.IO session has been opened: ', socket.id);
		request_headers.Authorization = 'Bearer ' + socket.id + store.config.token;
		processData(command,callback);
	});
	// fired when socket.io cannot connect (network errors)
	socket.on('connect_error', (error) => {
		console.log('Socket.IO session connect error: ', error);
	});
	// fired when socket.io cannot connect (login errors)
	socket.on('error', (error) => {
		console.log('Socket.IO session error: ', error);
	});
	// fired when socket.io disconnects from the server
	socket.on('disconnect', () => {
		console.log('Socket disconnected, terminating client.');
		//process.exit(-1);
	});
}


// this is called on console input
var processData = (data,callback) =>{
    
	console.log(" ##### Before authenticate --- ",store.config.token);
	
	console.log(" ##### After authenticate --- ",request_headers.Authorization);
	//checkForSockeAuth();
	
	//console.log(" ##### Calling ProcessData --- ",data);
	var input = data.toString().trim();

	// if the line was empty we don't want to do anything
	if (input === '') {
		//cli.emit('prompt');
		return;
	}

	// split input into command and parameters
	var inputloc = input.search('{');
	if (inputloc === -1) {
		inputloc = input.length;
	}
	var command = input.substr(0, inputloc).trim();
	var params = input.substr(inputloc).trim();

	// command must be registered with cli
//	if (cli.eventNames().indexOf(command) >= 0) {
	 // no need for this
   if (params.length > 0) {
			try {
            //	cli.emit(command, JSON.parse(params));
              var jPrams = JSON.parse(params);
							//jPrams.callback = callback;
							console.log(" >>>>>>>>>>>>> SENDING ",jPrams);
               send(jPrams,callback);    
        } catch (e) {
				console.log('could not parse JSON parameters: ', e);
			}
		} 
		 /* else {
			cli.emit(command, {});
		}*/
		//cli.emit('prompt');
	/*} else {
		console.log('command not found. available commands: ', cli.eventNames());
	}*/

};

var send = (params,callback) =>
{
    if (typeof(params.params) === 'undefined') {
		params.params = '';
	}
	// method and resource must be set for request to be sent
	if (typeof(params.method) === 'undefined') {
		console.log('command error: "method" parameter is missing.');
	} else if (typeof(params.resource) === 'undefined') {
		console.log('command error: "resource" parameter is missing.');
	} else {
	    console.log('@@@@@ Calling ', params.method);
		console.log('@@@@@ CallBACK <<<<<< ', callback);
		params.params = querystring.stringify(params.params);
		console.log('@@@@@ PARAMS <<<<<< ', 	params.params);
		request_processor(params.method, params.resource, params.params, callback);
		console.log('@@@@@ AFTER CallBACK <<<<<< ', callback);
	}
};

var request_processor = (method, resource, params, callback) => {
	var requestID = getNextRequestID();
    /*
    if (typeof(callback) === 'undefined') {
		callback = default_callback;
		console.log('request #', requestID, ' sending');
    }
    */
    
	if (typeof(method) === 'undefined') {
		method = "GET";
	}

	// GET HTTP(S) requests have parameters encoded in URL
	if (method === "GET") {
		resource += '/?' + params;
	}
	console.log(" +++++++++++++++ URL ",resource);
	var req = tradinghttp.request({
			host: store.config.trading_api_host,
			port: store.config.trading_api_port,
			path: resource,
			method: method,
			headers: request_headers
		}, (response) => {
			var data = '';
			response.on('data', (chunk) => data += chunk); // re-assemble fragmented response data
			response.on('end', () => {
                if (typeof(callback) !== 'undefined') 
                { callback(response.statusCode, requestID, data);}
                else{console.log(" FXCM RESP ",data);}
			});
		}).on('error', (err) => {
            if (typeof(callback) !== 'undefined') 
			{callback(0, requestID, err);} // this is called when network request fails
            else{console.log(" FXCM RESP ",err);}
        });

	// non-GET HTTP(S) reuqests pass arguments as data
	if (method !== "GET" && typeof(params) != 'undefined') {
		req.write(params);
	}
	req.end();
};


//
// begin Core functionality
//
var getNextRequestID = () => {
	return globalRequestID++;
};

/*
get_model((respId,reqId,data)=>{
	console.log(" $$$$$ RESP ID " , respId);
	console.log(" $$$$$ Request ID " , reqId);
	console.log(" $$$$$ DATA " , data);

});

*/
/*
store.config.token = '6fd837423aa6681b9e163363b2c95969528dbf39';//value;
authenticate ('{ "method":"GET", "resource":"/trading/get_model", "params": { "models":["Offer","OpenPosition","ClosedPosition","Order","Account", "Summary","LeverageProfile","Properties"] } }'
	,(respId,reqId,data)=>{
		console.log(" $$$$$ RESP ID " , respId);
		console.log(" $$$$$ Request ID " , reqId);
		console.log(" $$$$$ DATA " , data);
	
	});
*/
module.exports.get_model = get_model;