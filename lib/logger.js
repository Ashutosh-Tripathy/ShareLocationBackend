
//////////////////////Logging-start////////////////////////////
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
// { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }


var winston = require('winston');
var logLevel = getLogLevel();
var moment = require('moment');
  //Set unhandeld exception behaviour
winston.handleExceptions(new winston.transports.File({ filename: '/var/log/shl-www/exceptions.log' }));

//     new (winston.transports.Console)({ json: false, timestamp: function (){
    // return moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS");},level: logLevel, colorize:true }),

var winston = new (winston.Logger)({
    transports: [
        new winston.transports.File({ filename: '/var/log/shl-www' + '/debug.log', json: false, level: logLevel,
        timestamp: function (){
    return moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS");},colorize:true })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: '/var/log/shl-www' + '/exceptions.log', json: false, level: logLevel,
        timestamp: function (){
    return moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS");},colorize:true })
    ],
    exitOnError: false,
});
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

//Function to log messages.
exports.logger = function (logType, logMessage) {
    // logMessage = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' - ' + logMessage;
    switch (logType) {
        case 0:
            winston.error(logMessage);
            break;
        case 1:
            winston.warn(logMessage);
            break;
        case 2:
            winston.info(logMessage);
            break;
        case 3:
            winston.verbose(logMessage);
            break;
        case 4:
            winston.debug(logMessage);
            break;
        case 5:
            winston.silly(logMessage);
        default:
            break;
    }
};


//Detect environment and set log level
function getLogLevel() {
    var logLevel;
    if (process.env.NODE_ENV == 'production') {
        logLevel = 'verbose';
        // app.use(morgan('common', { skip: function (req, res) { return res.statusCode < 400 }, stream: __dirname + '/../morgan.log' }));
    } else {
        logLevel = 'debug';
        // app.use(morgan('dev', { skip: function (req, res) { return res.statusCode < 400 }, stream: __dirname + '/../morgan.log' }));
    }
    return logLevel;
}

//////////////////////Logging-end////////////////////////////

