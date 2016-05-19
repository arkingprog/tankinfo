var request = require('request');
var config=require('../lib/config');

var WGRequest=function(param) {
    this.zone=param.zone || 'ru';
    this.hostname=`api.worldoftanks.${this.zone}/wot/`;

    // Set the headers

/*
    var options = {
        url: 'https://api.worldoftanks.ru/wot/auth/prolongate/',
        method: 'POST',
        headers: headers,
        form: {'application_id': '8bd98daa7f662dbd8b17a2179141e6b6', 'access_token': 'yyy'}
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            //console.log(body)
        }
    });*/



};


WGRequest.prototype.updateAccessToken=function (accessToken) {
    var options = {
        url: 'https://api.worldoftanks.ru/wot/auth/prolongate/',
        method: 'POST',
        headers: config.headers,
        form: {'application_id': config.APPLICATION_ID, 'access_token': accessToken}
    };
    return new Promise(function(resolve,reject){
        request(options, function (error, response, body) {
            if(body.status==='error') reject(error);
            if (!error && response.statusCode == 200) {
                // Print out the response body
                resolve(body);
            }
            else{
                reject(error);
            }
        });

    });
    };
WGRequest.prototype.logout=function (accessToken) {
    var options = {
        url: 'https://api.worldoftanks.ru/wot/auth/logout/',
        method: 'POST',
        headers: config.headers,
        form: {'application_id': config.APPLICATION_ID, 'access_token': accessToken}
    };
    return new Promise(function(resolve,reject){
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                resolve(body);
            }
            else{
                reject(error);
            }
        });

    });
};


module.exports=WGRequest;

