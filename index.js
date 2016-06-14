var https = require('https');
var http = require('http');
var path = require('path');
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var mongoose = require('mongoose');
var request = require('request');
var config = require('./lib/config');
//my lib
var WGRequest = require('./lib/wg-request');
var wgRequest = new WGRequest({});
    wgRequest.request(
        'encyclopedia/vehicles', {
            tank_id: ['16897,13825']
        }).then((json)=> {
        console.log(json);
    });

//-----------------------------------------
var User = require('./model/user');
var currentUser = {test: 'test'};

var db = mongoose.createConnection(config.mongoURL);
var SessionSchema = new mongoose.Schema({
    //sid:{type:Number,index:true,min:1},
    access_token: {type: String},
    account_id: {type: String},
    expires_at: {type: String},
    nickname: {type: String}
});

var SessionDB = db.model('SessionDB', SessionSchema);

app.set('view engine', 'ejs');

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser('secret')); // read cookies (needed for auth)

app.use(cookieSession({
    keys: ['secret']
})); // session secret

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/public'));

app.use((req, res, next)=> {
    if (req.cookies.user) {
        SessionDB.findOne({account_id: req.cookies.user}, function (err, id) {
            if (id === null) {
                currentUser = {};
                next();
                return;
            }
            currentUser = new User({
                nickname: id.nickname,
                access_token: id.access_token,
                account_id: id.account_id,
                expires_at: id.expires_at
            });
            next();
        });
    } else {
        currentUser = {};
        next();
    }
});

app.get('/test', function (req, res) {
    if (req.cookies.user) {
        res.send(currentUser);
    } else {
        res.redirect('/');
    }
});

var isAuth = function (req, res, next) {
    if (req.cookies.user) {
        SessionDB.findOne({account_id: req.cookies.user}, function (err, id) {
            if (id === null) return;
            currentUser = new User({
                nickname: id.nickname,
                access_token: id.access_token,
                account_id: id.account_id,
                expires_at: id.expires_at
            });

            if ((Date.now() - id.expires_at * 1000) < 0) {
                //access token действительный
                //call update access_token
                if (-(Date.now() - id.expires_at * 1000) < 84600) {
                    wgRequest.updateAccessToken(currentUser.access_token)
                        .then(body => {
                            //find and update user in db then update cookies expires time
                            var tmp = (JSON.parse(body)).data;
                            id.access_token = tmp.data.access_token;
                            id.expires_at = tmp.data.expires_at;
                            id.save();
                            res.cookie('user', id.account_id, {maxAge: id.expires_at});
                        });
                }
            } else {
                //время прошло
                //reauth
                //res.redirect('/nationTank');
            }
        });
    } else {
        //нет куки - проходим авторизацию
        //auth
        //res.render('pages/index',{});
    }
    next();

};

app.get('/auth', isAuth, function (req, res, next) {
    if (!currentUser.isAuthenticated) {
        //auth
        var _this = res;
        if (req.query['status'] && req.query['access_token'] && req.query['nickname'] && req.query['account_id']) {
            currentUser = new User({
                nickname: String(req.query['nickname']),
                access_token: String(req.query['access_token']),
                account_id: String(req.query['account_id']),
                expires_at: String(req.query['expires_at']),
                isAuthenticated: true
            });
            SessionDB.findOneAndRemove({account_id: currentUser.account_id}, function (err, id) {
            });
            var newSession = new SessionDB(currentUser);
            newSession.save(function (error, item) {
                if (error) {
                    console.log(error);
                }
            });
            res.cookie('user', currentUser.account_id, {maxAge: currentUser.expires_at});
            res.redirect('/');

        } else if (!Object.keys(req.query).length) {
            var reqa = https.request(config.param, function (res) {
                var msg = '';
                res.on('data', function (data) {
                    //console.log(data);
                    msg += data;
                    //process.stdout.write(data);
                });
                res.on('end', function () {
                    var jsobj = {};
                    try {
                        jsobj = JSON.parse(msg);
                        if (jsobj["status"] == 'ok') {
                            //console.log(jsobj.data.location);
                            _this.redirect(jsobj.data.location);
                        } else {
                            throw ({
                                message: "Incorrect response from wargming server",
                                responseFromServer: data,
                                options: this.authorizationURL
                            });
                        }
                    } catch (e) {
                        _this.error({error: "incorrect data from server"});
                    }
                });
            });
            reqa.on('error', function (e) {
                console.error(e);
            });
            reqa.end();
        }
    }
    else {
        //nexts
        res.redirect('/');
    }
});
app.get('/', function (req, res) {

    res.render('pages/index', {isAuth: currentUser.isAuthenticated, nickname: currentUser.nickname});
});
app.get('/logout', function (req, res) {
    res.clearCookie('user');
    wgRequest.logout(currentUser.access_token).then(body=> {
        SessionDB.findOneAndRemove({access_token: currentUser.access_token}, (err, user)=> {
            currentUser = {};
            res.redirect('/');
        });
    });

});

app.get('/login', function (req, res) {
    req.session.user = USER.nickname || 'test';

    res.send('user: ' + USER.nickname);
});
app.get('/nationTank.html', function (req, res) {
    res.send('nation tank');
});
app.listen(port, function () {
    console.log('Example app listening on port', port);
});

``