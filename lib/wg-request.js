var request = require('request');
var fetch = require('node-fetch');
var config = require('../lib/config');

var options = {
    url: 'https://api.worldoftanks.ru/wot/auth/prolongate/',
    method: 'POST',
    headers: config.headers,
    form: {'application_id': config.APPLICATION_ID, 'access_token': ''}
};

var WGRequest = function (param) {
    this.zone = param.zone || 'ru';
    this.hostname = `api.worldoftanks.${this.zone}/wot/`;
    this.access_token = param.access_token;
    this.options = {
        url: `https://${this.hostname}`,
        headers: config.headers
    };
};

WGRequest.prototype.request = function (method, param) {
    let baseUrl = `https://api.worldoftanks.ru/wot/${method}/?application_id=${config.APPLICATION_ID}`;
    if (this.access_token) baseUrl += `&access_token=${this.access_token}`;
    for (var key in param) {
        baseUrl += `&${key}=${param[key].toString()}`;
    }
    return fetch(baseUrl)
        .then(function (res) {
            return res.json();
        });
};

WGRequest.prototype.updateAccessToken = function (accessToken) {
    var options = {
        url: 'https://api.worldoftanks.ru/wot/auth/prolongate/',
        method: 'POST',
        headers: config.headers,
        form: {'application_id': config.APPLICATION_ID, 'access_token': accessToken}
    };
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (body.status === 'error') reject(error);
            if (!error && response.statusCode == 200) {
                // Print out the response body
                resolve(body);
            }
            else {
                reject(error);
            }
        });

    });
};

WGRequest.prototype.logout = function (accessToken) {
    var options = {
        url: 'https://api.worldoftanks.ru/wot/auth/logout/',
        method: 'POST',
        headers: config.headers,
        form: {'application_id': config.APPLICATION_ID, 'access_token': accessToken}
    };
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                resolve(body);
            }
            else {
                reject(error);
            }
        });
    });
};


module.exports = WGRequest;

