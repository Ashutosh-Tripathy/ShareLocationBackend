// note, io(<port>) will create a http server for you
var moment = require('moment');
var logger = require('./lib/logger.js').logger;
var config = require('./config/config.js').config;
// var http = require('http');
var port = config.port;
var secret = config.secret;
var connectionString = config.connectionString;
var md5 = require('md5');
var util = require('util');
var app = require('express')()
    .listen(port);;
var io = require('socket.io')(app);
// var app = require('http').createServer();

var pgOperation = require('./lib/pgOperation.js').pgOperation;;

var port = config.port;
var connectedUser = {};
var msgPresentInDbForUserList = {};
var userTokenList = {};
var req = {};
var res = {};
Date.prototype.getUTCTime = function() {
    return moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS");
};
var env = process.env.NODE_ENV || 'development';
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
//log wrapper
var log = function(logType, logMessage, req, res) {
    logger(logType, logMessage);
};


//Intializing msgPresentInDbForUserList when app restart/crash.
log(2, "Intializing msgPresentInDbForUserList.");
pgOperation("SELECT DISTINCT(RECEIVER_ID) FROM LOCATION WHERE STATUS=1;", [], req, res, 'R', function(err, data, fields) {
    if (err) {
        log(0, "Database error: " + err);
        return;
    }
    // res.json();
    if (data.rows.length != 0) {
        for (var i = 0; i < data.rows.length; i++) {
            msgPresentInDbForUserList[data.rows[i].receiver_id] = true;
        }
    }
    log(4, "Intializing msgPresentInDbForUserList completed.");
    // log(4, "msgPresentInDbForUserList: " + util.inspect(msgPresentInDbForUserList));
});


io.on('connection', function(socket) {
    var userId;
    var auth = false;
    log(3, ":Id " + userId + " : Socket object on connections: " + util.inspect(socket.handshake.query));
    authenticateUser();

    // console.log('connected: ' + userId + ' in ' + Object.getOwnPropertyNames(connectedUser));
    socket.on("shareLocation", function(message, fn) {
        if (!auth) {
            log(1, ":Id " + userId + " : Unauthorized access. shareLocation method");
            socket.emit("unauthorizedAccess");
            return;
        }
        var locationDetail = message;
        if (!locationDetail || !locationDetail.latitude)
            log(0, ":Id " + userId + " : ArgumentNullException: Location details missing. (security issue).", req, res);
        else {
            //JSON.parse('[{"mobile_number":"9867917163","message":"SECOND LOCATION","latitude":"11.1122330","longitude":"22.2233110"}]');

            if (locationDetail.created_time) {
                var timeDiff = Date.parse(moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS")) - Date.parse(locationDetail.created_time);
                log(4, ":Id " + userId + " : Time  diff: " + timeDiff + " moment:created_teme " + moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS") + locationDetail.created_time,
                    req, res);
                if (timeDiff > 8000) {
                    log(2, ":Id " + userId + " : Timed out message received. Time diff: " + timeDiff, req, res);
                    return;
                }
            } else {
                log(1, ":Id " + userId + " : ArgumentNullException: missing created_time");
                return;
            }
            if (!locationDetail.mobile_number) {
                log(0, ":Id " + userId + " : ArgumentNullException: mobile number missing(security issue)." + util.inspect(locationDetail), req, res);
                return;
            }
            //Trimming if mobile number length is more than 10.
            if (locationDetail.mobile_number.toString().length > 10)
                locationDetail.mobile_number = locationDetail.mobile_number % 10000000000;
            locationDetail.sender_id = userId;
            log(2, ":Id " + userId + " : Got new location to share to mobile: " + locationDetail.mobile_number);
            locationDetail.status = 1;
            locationDetail.created_time = moment.utc().toISOString();
            //Will return column locationid integer, receiverid integer.
            pgOperation("SELECT locationid as location_id ,receiverid as receiver_id FROM insert_location($1,$2,$3,$4,$5,$6,$7,$8);",
                //sending receiverid as 0 as we don't know this id.
                [locationDetail.sender_id, 0, locationDetail.message, locationDetail.created_time, locationDetail.latitude,
                    locationDetail.longitude, locationDetail.status, locationDetail.mobile_number
                ], req, res, 'J',
                function(err, data, fields) {
                    if (err) {
                        log(0, ":Id " + userId + " : Database error: " + err);
                        log(3, ":Id " + userId + " : Calling shareLocationResponse(false).");
                        socket.emit("shareLocationResponse", [{
                            response: "fail"
                        }]);
                        return;
                    }
                    //data.rows[0].user_id will check it mobile number is registered or not.
                    log(3, ":Id " + userId + " : Data received as" + util.inspect(data.rows[0]));
                    if (data.rows.length != 0) {
                        //if greater then 0 then we got receiver id in response.
                        locationDetail.location_id = data.rows[0].location_id;
                        locationDetail.receiver_id = data.rows[0].receiver_id;
                        if (locationDetail.receiver_id > 0) {
                            if (!msgPresentInDbForUserList[locationDetail.receiver_id])
                                msgPresentInDbForUserList[locationDetail.receiver_id] = true;
                            log(3, ":Id " + userId + " : Calling shareLocationResponse(true).");
                            socket.emit("shareLocationResponse", [{
                                response: "success",
                                location_id: locationDetail.location_id,
                                receiver_id: locationDetail.receiver_id,
                                message: locationDetail.message,
                                created_time: locationDetail.created_time,
                                latitude: locationDetail.latitude,
                                longitude: locationDetail.longitude,
                                status: locationDetail.status,
                                mobile_number: locationDetail.mobile_number
                            }]);
                            if (connectedUser[locationDetail.receiver_id]) {
                                log(3, ":Id " + userId + " : Calling invokeCheckNewReceivedMessage. Receiver id: " + locationDetail.receiver_id);
                                connectedUser[locationDetail.receiver_id].emit("invokeCheckNewReceivedMessage");
                            }
                        } else {
                            // log(3, ":Id " + userId + " : Calling shareLocationResponse(Num not registered).");
                            socket.emit("shareLocationResponse", [{
                                response: "notreg",
                                location_id: 0,
                                receiver_id: 0,
                                message: locationDetail.message,
                                created_time: locationDetail.created_time,
                                latitude: locationDetail.latitude,
                                longitude: locationDetail.longitude,
                                status: locationDetail.status,
                                mobile_number: locationDetail.mobile_number
                            }]);
                            log(3, ":Id " + userId + " : Mobile number not registered: " + locationDetail.mobile_number);
                        }
                    }
                });
            log(4, ":Id " + userId + " : shareLocation completed.");
        }
        // fn(true);
    });

    socket.on('checkNewReceivedMessage', function() {
        if (!msgPresentInDbForUserList[userId]) {
            log(3, ":Id " + userId + " : msgPresentInDbForUserList do not have userid, so returning. userid: " + userId, req, res);
            // log(4, ":Id " + userId + " : msgPresentInDbForUserList: " + util.inspect(msgPresentInDbForUserList));
            return;
        }

        if (!auth) {
            log(1, ":Id " + userId + " : Unauthorized access. checkNewReceivedMessage method");
            socket.emit("unauthorizedAccess");
            return;
        }
        log(3, ":Id " + userId + " : CheckNewReceivedMessage from user: " + userId);
        pgOperation("select * FROM  get_unreceived_location($1);", [userId], req, res, 'R', function(err, data, fields) {
            if (err) {
                log(0, ":Id " + userId + " : Database error: " + err);
                return;
            }
            log(4, "checkNewReceivedMessageResponse: " + util.inspect(data.rows[0]));
            // res.json();
            if (data.rows.length != 0) {
                log(2, ":Id " + userId + " : Emiting checkNewReceivedMessageResponse from checkNewReceivedMessage for user: " + userId);
                socket.emit("checkNewReceivedMessageResponse", data.rows);
            }
            delete msgPresentInDbForUserList[userId];
            log(4, ":Id " + userId + " : Deleting from msgPresentInDbForUserList userid: " + userId);
        });
    });

    socket.on("signupUser", function(message, fn) {

        var signupDetail = message;
        // locationDetail = locationDetail[0];
        if (!signupDetail || !signupDetail.first_name || !signupDetail.last_name || !signupDetail.mobile_number || !signupDetail.otp || signupDetail.mobile_number.length < 10) {
            log(0, ":Id " + userId + " : ArgumentNullException: Missing signupDetail detail. (security issue)." + util.inspect(signupDetail), req, res);
            socket.emit("signUpResponse", [{
                response: "fail"
            }]);
        } else {
            if (signupDetail.created_time) {
                var timeDiff = Date.parse(moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS")) - Date.parse(signupDetail.created_time);
                log(4, ":Id " + userId + " : Time  diff: " + timeDiff + " moment:created_time " + moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS") + ":" +
                    signupDetail.created_time, req, res);
                if (timeDiff > 8000) {
                    log(2, ":Id " + userId + " : Timed out signup request. Time diff: " + timeDiff, req, res);
                    socket.emit("signUpResponse", [{
                        response: "fail"
                    }]);
                    return;
                }
            }

            log(2, ":Id " + userId + " : Got new signup from user: " + util.inspect(signupDetail), req, res);
            if (signupDetail.otp == "1234") {
                pgOperation("select add_update_user($1,$2,$3,$4) as user_id;", [signupDetail.first_name, signupDetail.last_name, signupDetail.mobile_number, 91], req, res, 'C',
                    function(err, data, fields) {
                        if (err) {
                            log(0, ":Id " + userId + " : Database error: " + err);
                            socket.emit("signUpResponse", [{
                                response: "fail"
                            }]);
                            log(3, ":Id " + userId + " : Emitting signUpResponse: fail.");
                            return;
                        }
                        if (data.rows.length != 0) {
                            var user_id = data.rows[0].user_id;
                            log(3, ":Id " + userId + " : Successful signup for user: " + user_id);
                            // log(4,"md5 string: "+config.secret+userId);
                            var hash_server_token = md5(config.secret + user_id + moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS"));
                            pgOperation('UPDATE  USERS SET TOKEN=$2 WHERE USER_ID=$1;', [user_id, hash_server_token], req, res, 'C', function(err, data, fields) {
                                if (err) {
                                    log(0, ":Id " + userId + " : Database error: " + err);
                                    return;
                                }
                                userTokenList[user_id] = hash_server_token;
                                log(4, "Token generated for userid:token " + user_id + " : " + hash_server_token);
                                socket.emit("signUpResponse", [{
                                    response: "success",
                                    user_id: user_id,
                                    token: hash_server_token
                                }]);
                                log(2, ":Id " + userId + " : User successfully signedup with mobile: " + signupDetail.mobile_number);
                                log(4, ":Id " + userId + " : Disconnected user (signup): " + userId, req, res);
                                delete connectedUser[userId];
                                userId = user_id;
                                connectedUser[userId] = socket;
                                userTokenList[userId] = hash_server_token;
                                auth = true;
                                // socket.handshake.query = "hash_client_token=" + hash_server_token +
                                //     ";user_id=" + user_id;
                                // connectedUser[userId] = socket;
                                log(3, ":Id " + userId + " : Connected user (signup): " + userId, req, res);

                                // log(2, ":Id " + userId + " : Emitting signUpResponse: success. userid : hashServerToken " + user_id + " : " + hash_server_token);
                            });

                        }
                    });
            } else {
                socket.emit("signUpResponse", [{
                    response: "wrongotp"
                }]);
                log(2, ":Id " + userId + " : Emitting signUpResponse: wrongotp.");
            }
        }
    });

    socket.on('disconnect', function() {
        delete connectedUser[userId];
        log(3, ":Id " + userId + " : Disconnected user: " + userId, req, res);
    });


    // setTimeout(function () {
    //     if (!socket.auth) {
    //         log(3, ":Id "+userId +" : Diconnecting unauthorized socket: " + socket.id);
    //         socket.disconnect();
    //     }
    // }, 1000);

    //Authenticate user
    function authenticateUser() {
        auth = false;
        var data = socket.handshake;
        if (data.query) {
            var user_id = data.query.user_id;
            var hashClientToken = data.query.hash_client_token;
            log(3, "Received from request value of userId : hashClientToken " + user_id + ":" + hashClientToken);
            //This condition will be false when user open app first time.
            if (user_id && hashClientToken != 'null') {
                log(4, ":Id " + userId + " : userTokenList: " + util.inspect(userTokenList));

                //token not present in so querying db.
                if (!userTokenList[user_id]) {
                    log(4, "userTokenList do not have token for user: " + user_id + " token");
                    pgOperation("SELECT TOKEN FROM USERS WHERE USER_ID=$1;", [user_id], req, res, 'R', function(err, data1, fields) {
                        if (err) {
                            log(0, ":Id " + userId + " : Database error: " + err);
                            return;
                        }
                        // res.json();
                        if (data1.rows.length != 0) {
                            // log(4, "Got token from db. token: " + data1.rows[0].token);
                            userTokenList[user_id] = data1.rows[0].token;
                            if (userTokenList[user_id] === hashClientToken) {
                                auth = true;
                                delete connectedUser[userId];
                                userId = user_id;
                                connectedUser[userId] = socket;
                                log(3, ":Id " + userId + " : Connected.", req, res);
                                if (msgPresentInDbForUserList[userId]) {
                                    log(3, ":Id " + userId + " : Calling invokeCheckNewReceivedMessage on successful auth.");
                                    connectedUser[userId].emit("invokeCheckNewReceivedMessage");
                                } else {
                                    log(3, ":Id " + userId + " : Authentication is successful for user: " + data.query.user_id);
                                }
                                // socket.emit("onAuthentication", { response: true });
                            } else {
                                log(2, ":Id " + userId + " : Unauthorized access detected.");
                                log(4, "hashServerToken:hashClientToken " + userTokenList[user_id] + " : " + hashClientToken)
                                auth = false;
                            }
                        } else {
                            log(1, ":Id " + userId + " : Not able to find hashcode in db and userTokenList for user: " + user_id);
                        }
                    });
                } else {
                    if (userTokenList[user_id] === hashClientToken) {
                        auth = true;
                        delete connectedUser[userId];
                        userId = user_id;
                        connectedUser[userId] = socket;
                        log(3, ":Id " + userId + " : Connected.", req, res);
                        if (msgPresentInDbForUserList[userId]) {
                            log(3, ":Id " + userId + " : Calling invokeCheckNewReceivedMessage on successful auth.");
                            connectedUser[userId].emit("invokeCheckNewReceivedMessage");
                        } else {
                            log(3, ":Id " + userId + " : Authentication is successful for user: " + data.query.user_id);
                        }
                        // socket.emit("onAuthentication", { response: true });
                    } else {
                        log(2, ":Id " + userId + " : Unauthorized access detected.");
                        log(2, "hashServerToken:hashClientToken " + userTokenList[user_id] + " : " + hashClientToken);
                        auth = false;
                        // socket.emit("onAuthentication", { response: 403 });
                        // return;
                    }
                }
            } else {
                // socket.emit("onAuthentication", { response: 401 });
                log(1, ":Id " + userId + " : Authentication token missing.");
            }
            // connectedUser[userId] = socket;
        }
    }
});

process.on('uncaughtException', function(error) {
    log(1, "uncaughtException: " + error.stack);
});

console.log(" server listening on: " + port);