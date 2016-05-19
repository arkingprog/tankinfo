var WGrequest = require('../lib/wg-request');
var mongoose=require('mongoose');
var config=require('../lib/config');

var db=mongoose.createConnection(config.mongoURL);
var SessionSchema=new mongoose.Schema({
    //sid:{type:Number,index:true,min:1},
    access_token:{type: String},
    account_id:{type: String},
    expires_at:{type:String},
    nickname:{type:String}
});

var SessionDB=db.model('SessionDB',SessionSchema);

var User=function(param){
    this.nickname=param.nickname;
    this.access_token=param.access_token;
    this.account_id=param.account_id;
    this.expires_at=param.expires_at;
    var that=this;

    this.isAuthenticated=auth();



    function auth(){
    if(that.expires_at*1000-Date.now()>0)
        return true;
    else
        return false;
    }

};



module.exports=User;