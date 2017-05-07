(function () {
    var secret=require('./secret.js');
    var config={
        port:8080,
	isSmsEnabled:true,
        connectionString:secret.connectionString,
        secret:secret.secret_key
    }
    
    module.exports = config;
})();
