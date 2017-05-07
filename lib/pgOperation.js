var pg = require('pg');
pg.defaults.poolSize = 75;
pg.defaults.poolIdleTimeout = 15000;
var config = require('../config/config.js').config;
var connectionString = config.connectionString;
var logger = require('./logger.js').logger;
var log = function (logType, logMessage, req, res) {
    logger(logType, logMessage);
};

exports.pgOperation =
    function pgOperation(command, parameters, req, res, queryType, callback) {
        var results = [];
        // Get a Postgres client from the connection pool
        pg.connect(connectionString, function (err, client, done) {
            // Handle connection errors
            if (err) {
                done();
                log(0, err, req, res);
                return res;
            }
            // log(4, "pgOperation query type: " + queryType);
            // Stream results back one row at a time
            switch (queryType) {
                case 'R':
                    var query = client.query(command, parameters, callback)
                    query.on('row', function (row) {
                        results.push(row);
                    });
                    query.on('end', function () {
                        done();
                    });
                    break;
                case 'C':
                    var query = client.query(command, parameters, callback);
                    query.on('end', function () {
                        done();
                    });
                    break;
                case 'J':
                    var query = client.query(command, parameters, callback);
                    query.on('row', function (row) {
                        results.push(row);
                    });
                    query.on('end', function () {
                        done();
                    });
                    break;
                default:
                    done();
                    break;
            }
        });
    };

