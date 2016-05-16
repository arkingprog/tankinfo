var WGRequest=function(param) {
    this.zone=param.zone || 'ru';
    this.hostname=`api.worldoftanks.${this.zone}/wot/`;
    WGRequest.prototype.hey = function () {
        return this.hostname;
    };
};
module.exports=WGRequest;

