'use strict';


var https=require('https');
var http=require('http');

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cookieSession = require('cookie-session');
var mongoose=require('mongoose');
var config=require('./lib/config');


/*
requestify.post('https://api.worldoftanks.ru/wot/auth/prolongate/',
        'application_id=8bd98daa7f662dbd8b17a2179141e6b6&access_token=1'
    )
    .then(function(response) {
        // Get the response body (JSON parsed or jQuery object for XMLs)
        response.getBody();

        // Get the raw response body
        console.log(response.body);
    });*/

///////////////////////////////////////////////////////////////////////////////////
var request = require('request');

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
};

// Configure the request
var options = {
    url: 'https://api.worldoftanks.ru/wot/auth/prolongate/',
    method: 'POST',
    headers: headers,
    form: {'application_id': '8bd98daa7f662dbd8b17a2179141e6b6', 'access_token': 'yyy'}
}

// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body)
    }
})


///////////////////////////////////////////////////////////////////////////////////

var db=mongoose.createConnection(config.mongoURL);
var SessionSchema=new mongoose.Schema({
    //sid:{type:Number,index:true,min:1},
    access_token:{type: String},
    account_id:{type: String},
    expires_at:{type:String},
    nickname:{type:String}
});

var SessionDB=db.model('SessionDB',SessionSchema);
var USER={};

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser('secret')); // read cookies (needed for auth)

app.use(cookieSession({
    keys:['secret']
})); // session secret

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/test',function(req,res){
    if(req.cookies.user){
        res.send(req.cookies.user);
    } else{
     res.redirect('/');
    }
    /*var n=req.session.views || 0;
    req.session.views=++n;
    res.end(n + ' views');
    console.log(req.session);
*/

});

var isAuth=function(req,res,next){
    if(req.cookies.user){
        SessionDB.findOne({account_id:req.cookies.user},function(err,id){
            var expDate=id.expires_at*1000;
            if((expDate-Date.now())>0)
            {
                //call update access_token
            }else{
                //reauth
            }
        });
    }else {
        //auth
    }
    next();
};

app.get('/',isAuth,function(req,res){
    var _this=res;
    if(req.query['status'] && req.query['access_token'] && req.query['nickname'] && req.query['account_id']){
        USER={
            nickname:String(req.query['nickname']),
            access_token:String(req.query['access_token']),
            account_id:String(req.query['account_id']),
            expires_at:String(req.query['expires_at'])
        }
        var newSession=new SessionDB(USER);
        newSession.save(function(error,item){
           if(error){
               console.log(error);
           }
        });
        res.cookie('user',USER.account_id,{maxAge:USER.expires_at});
        res.redirect('/login');

    }else
    if(!Object.keys(req.query).length){
        var reqa=https.request(config.param,function(res){
            var msg='';
            res.on('data',function(data){
                //console.log(data);
                msg+=data;
                //process.stdout.write(data);
            });
            res.on('end',function(){
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
                    _this.error({error:"incorrect data from server"});
                }

            });
        });
        reqa.on('error',function(e){
            console.error(e);
        });

        reqa.end();

    }

});
app.get('/login', function (req, res) {
    req.session.user=USER.nickname || 'test';

    res.send('user: '+USER.nickname);
});

app.listen(port, function () {
    console.log('Example app listening on port', port);
});


