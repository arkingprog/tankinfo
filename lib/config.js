var appID='8bd98daa7f662dbd8b17a2179141e6b6';
var returnURL='http://localhost:3000/auth';
exports.APPLICATION_ID=appID;
exports.mongoURL='mongodb://arking:arking@ds036069.mlab.com:36069/tankinfo';
exports.param={
    hostname: 'api.worldoftanks.ru',
    port: 443,
    path: '/wot/auth/login/?application_id=' + appID + '&redirect_uri='+returnURL+'&nofollow=1',
    method: 'GET'
};
exports.headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
};