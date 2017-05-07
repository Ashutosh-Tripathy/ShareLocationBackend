var secret=require('./secret.js').secret;
exports.config = {
    port:8080,
    isSmsEnabled:true,
    connectionString:secret.connectionString,
    secret:secret.secret_key
};