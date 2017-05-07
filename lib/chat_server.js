// note, io(<port>) will create a http server for you
var port = 443;
var app = require('http').createServer();
var io = require('socket.io')(app);
app.listen(port);
var connectedUser = {};
var userId = 1;
io.on('connection', function (socket) {
    connectedUser[userId] = socket
    console.log('connected: ' + userId + ' in ' + Object.getOwnPropertyNames(connectedUser));
    // socket.emit('news', { hello: 'world' });
    // connectedUser[userId].send("hi 1");
    // socket.on('my other event', function (data) {
    //     console.log(data);
    // });
    socket.on("message", function (message, fn) {
        console.log('received from ' + userId + ': ')

        var toUserWebSocket = 2;//connectedUser[messageArray[0]]
        if (toUserWebSocket) {
            console.log('sent to ' + toUserWebSocket + ': ' + JSON.stringify(message))
            //            messageArray[0] = userId
            toUserWebSocket.send(JSON.stringify(message));
        }
        fn(true);
    });

    socket.on('disconnect', function () {
        delete connectedUser[userId];
        console.log('deleted: ' + userId);
    });

    socket.on('checkNewReceivedMessage', function () {

    });
});
console.log(" server listening on: " + port);

// var moment = require('moment');
// Date.prototype.getUTCTime = function () {
//     return moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS");
// };
// var port = process.env.PORT || 8081;
// var webSocketServer = new (require('ws')).Server({ port: port });
// var connectedUser = {};
// var userId = 1;

// webSocketServer.on('connection', function (socket) {

//     var userId = parseInt(socket.upgradeReq.url.substr(1), 10)
//     connectedUser[userId] = socket
//     console.log('connected: ' + userId + ' in ' + Object.getOwnPropertyNames(connectedUser));

//     socket.on('message', function (message) {
//         console.log('received from ' + userId + ': ' + message)
//         var messageArray = JSON.parse(message)
//         var toUserWebSocket = connectedUser[messageArray[0]]
//         if (toUserWebSocket) {
//             console.log('sent to ' + messageArray[0] + ': ' + JSON.stringify(messageArray))
//             messageArray[0] = userId
//             toUserWebSocket.send(JSON.stringify(messageArray))
//         }
//     });

// socket.on('close', function () {
//         delete connectedUser[userId]
//         console.log('deleted: ' + userId)
//     });    
// });



// console.log('Listening on port: ' + port + ' - ' + 'time: ' + new Date().getUTCTime() + '........');



// // //Assigning a guest name
// // function assignGuestName() {
// //     return 1;
// // }

// // //Sending a chat message.
// // function handleMessageBroadcasting(socket) {
// //     socket.on('message', function (message) {
// //         socket.broadcast.to(message.room).emit('message', {
// //             text: socket.id + ': ' + message.text
// //         });
// //     });   
// // }


// // //Crating rooms
// // function handleRoomJoining(socket) {
// //     socket.on('join', function (room) {
// //         // socket.leave(currentRoom[socket.id]);
// //         joinRoom(socket, room.newRoom);
// //     });
// // }

// // //Handling user disconnection.
// // function handleClientDisconnection(socket) {
// //     socket.on('disconnect', function () {
// //         var userId = socket.id;
// //         // delete namesUsed[nameIndex];
// //         // delete nickNames[socket.id];
// //     });
// // }


// // // function findClientsSocket(roomId, namespace) {
// // //     var res = []
// // //     , ns = io.of(namespace || "/");    // the default namespace is "/"
    
// // //     if (ns) {
// // //         for (var id in ns.connected) {
// // //             if (roomId) {
// // //                 var index = ns.connected[id].rooms.indexOf(roomId);
// // //                 if (index !== -1) {
// // //                     res.push(ns.connected[id]);
// // //                 }
// // //             } else {
// // //                 res.push(ns.connected[id]);
// // //             }
// // //         }
// // //     }
// // //     return res;
// // // }


// // // Logic related to joing a room
// // // function joinRoom(socket, room) {
// // //     socket.join(room);
// // //     currentRoom[socket.id] = room;
// // //     socket.emit('joinResult', { room: room });
// // //     socket.broadcast.to(room).emit('message', {
// // //         text: nickNames[socket.id] + ' has joined ' + room + '.'
// // //     });
    
// // //     //var usersInRoom = socketio.clients(function (error, clients) {
// // //     //    if (error) throw error;
// // //     //    return clients; // => [Anw2LatarvGVVXEIAAAD]
// // //     //});
    
// // //     //var usersInRoom = io.sockets.clients(room);
    
// // //     var usersInRoom = io.nsps['/'].adapter.rooms[room];//findClientsSocket(room);
// // //     if (Object.keys(usersInRoom).length > 1) {
// // //         var flag = false;
// // //         var usersInRoomSummary = 'Users currently in ' + room + ': ';
// // //         for (var index in usersInRoom) {
// // //             var userSocketId = index;//usersInRoom[index].id;
// // //             if (userSocketId != socket.id) {
// // //                 //if (index > 0) {
// // //                 if (flag)
// // //                     usersInRoomSummary += ', ';
// // //                 else
// // //                     flag = true;
                
// // //                 //}
// // //                 usersInRoomSummary += nickNames[userSocketId];
// // //             }
// // //         }
// // //         usersInRoomSummary += '.';
// // //         socket.emit('message', { text: usersInRoomSummary });
// // //     }
// // // }



// // // //Logic to handle name-request attempts
// // // function handleNameChangeAttempts(socket, nickNames, namesUsed) {
// // //     socket.on('nameAttempt', function (name) {
// // //         if (name.indexOf('Guest') == 0) {
// // //             socket.emit('nameResult', {
// // //                 success: false,
// // //                 message: 'Names cannot begin with "Guest".'
// // //             });
// // //         } else {
// // //             if (namesUsed.indexOf(name) == -1) {
// // //                 var previousName = nickNames[socket.id];
// // //                 var previousNameIndex = namesUsed.indexOf(previousName);
// // //                 namesUsed.push(name);
// // //                 nickNames[socket.id] = name;
// // //                 delete namesUsed[previousNameIndex];
                
// // //                 socket.emit('nameResult', {
// // //                     success: true,
// // //                     name: name
// // //                 });
// // //                 socket.broadcast.to(currentRoom[socket.id]).emit('message', {
// // //                     text: previousName + ' is now known as ' + name + '.'
// // //                 });
// // //             } else {
// // //                 socket.emit('nameResult', {
// // //                     success: false,
// // //                     message: 'That name is already in use.'
// // //                 });
// // //             }
// // //         }
// // //     });
// // // }




// //Get all received location for a user.
// app.get('/getLocation', function (req, res) {
//     var user_id = req.query.user_id;
//     if (!user_id) {
//         log(0, "ArgumentNullException: User id missing(security issue).", req, res);
//         return res.end();
//     }
//     pgOperation("SELECT L.LOCATION_ID,L.MESSAGE,L.SENDER_ID,L.CREATED_TIME,L.LATITUDE,L.LONGITUDE,L.STATUS,U2.MOBILE_NUMBER FROM USERS U1 INNER JOIN LOCATION L ON U1.USER_ID=$1 AND "
//         + "U1.USER_ID=L.RECEIVER_ID INNER JOIN USERS U2 ON U2.USER_ID=L.SENDER_ID WHERE  L.STATUS=1;"
//         , [user_id], req, res, 'R', function (err, data, fields) {
//             if (err) {
//                 log(0, "Database error: " + err);
//                 return;
//             }

//             res.json(data.rows);
//             if (data.rows.length != 0) {
//                 // var locationIds = "";
//                 // for (var i = 0; i<data.rows.length; i++) {
//                 // 	locationIds += data.rows[i].location_id;
//                 // 	if (i != data.rows.length - 1)
//                 // 		locationIds += ", ";
//                 var locationIds = [];
//                 for (var i = 0; i < data.rows.length; i++) {
//                     locationIds.push(data.rows[i].location_id);
//                 }
//                 pgOperation('UPDATE  LOCATION SET STATUS=2 WHERE STATUS=1 AND LOCATION_ID = ANY($1::int[]) ;'
//                     , [locationIds], req, res, 'C');
//             }
//         });
// });

// //Send a location.
// app.post('/postLocation', function (req, res) {
//     var locationDetail = req.body;
//     // locationDetail = locationDetail[0];
//     if (!locationDetail || !locationDetail.latitude)
//         log(0, "ArgumentNullException: Location details missing. (security issue).", req, res);
//     else {
//         //JSON.parse('[{"mobile_number":"9867917163","message":"SECOND LOCATION","latitude":"11.1122330","longitude":"22.2233110"}]');
//         locationDetail.created_time = moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS");// new Date().getUTCTime();
//         locationDetail.receiver_id = 2;
//         // locationDetail.sender_id=1;
//         //Check wheter sender mobile number already in database or not.
//         locationDetail.receiver_id = pgOperation("SELECT USER_ID FROM USERS WHERE MOBILE_NUMBER=$1;",
//             [locationDetail.mobile_number], req, res, 'J', function (err, data, fields) {
//                 if (err) {
//                     log(0, "Database error: " + err);
//                     return;
//                 }
//                 if (data.rows.length != 0 && data.rows[0].user_id) {
//                     locationDetail.receiver_id = data.rows[0].user_id;
//                     pgOperation("INSERT INTO LOCATION (SENDER_ID , RECEIVER_ID, MESSAGE , CREATED_TIME ,LATITUDE , LONGITUDE, STATUS) VALUES ($1,$2,$3,$4,$5,$6,$7);"
//                         , [locationDetail.sender_id, locationDetail.receiver_id, locationDetail.message, locationDetail.created_time, locationDetail.latitude,
//                             locationDetail.longitude, 1], req, res, 'C');
//                     return res.status(200).end();
//                 }
//             });
//     }
// });

// app.get('*', function (req, res) {
//     log(0, "Invalid operation: Got get request on app (security issue).", req, res);
//     return res.end();
// });
// app.post('*', function (req, res) {
//     var data = req.body;
//     // console.log("req data"+data);
//     //Check wheather data is in proper format
//     if (data.Id) {
//         res.end("Share location web api started");
//     }
//     else {
//         log(0, "Received data in inappropriate format: UserId missing (security issue)..", req, res);
//         return res.end();
//     }
// });

// var port = 443;
// app.listen(port);
// console.log('Listening on port: ' + port + ' - ' + 'time: ' + new Date().getUTCTime() + '........');


// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
//log wrapper
var log = function (logType, logMessage, req, res) {
    logger(logType, logMessage);
    if (logType === 0 && res)
        res.status(500);
};

// 
// var cluster = require('cluster');
// 
// var workers = process.env.WORKERS || require('os').cpus().length;
// 
// if (cluster.isMaster) {
// 
//   console.log('start cluster with %s workers', workers);
// 
//   for (var i = 0; i < workers; ++i) {
//     var worker = cluster.fork().process;
//     console.log('worker %s started.', worker.pid);
//   }
// 
//   cluster.on('exit', function(worker) {
//     console.log('worker %s died. restart...', worker.process.pid);
//     cluster.fork();
//   });
// 
// } else {
// 
//   var http = require('http');
//   http.createServer(function (req, res) {
//     res.end("Look Mum! I'm a server!\n");
//   }).listen(3000, "127.0.0.1");
// 
// }
// 
// process.on('uncaughtException', function (err) {
//   console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
//   console.error(err.stack)
//   process.exit(1)
// })
// nohup node server.js > /dev/null 2>&1 &
//forever serer.js








// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
// { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }


//Handle uncaught exception
// process.on('uncaughtException', function (err) {
//     // console.error(err);
//     log(0, "UnCaughtException: " + err);
//     console.log("Node NOT Exiting...");
// });

// app.get('*.ico', function (req, res) {
// 	return res.end();
// });



// locationDetail.receiver_id = data.rows[0].user_id;
                        //Setting defalut value of status (1)
                        // locationDetail.status = 1;
                        // pgOperation("INSERT INTO LOCATION (SENDER_ID , RECEIVER_ID, MESSAGE , CREATED_TIME ,LATITUDE , LONGITUDE, STATUS) VALUES ($1,$2,$3,$4,$5,$6,$7);"
                        //     , [locationDetail.sender_id, locationDetail.receiver_id, locationDetail.message, locationDetail.created_time, locationDetail.latitude,
                        //         locationDetail.longitude, locationDetail.status], req, res, 'C',
                        //     function (err, data, fields) {
                        //         log(2, "Received location from userid: " + locationDetail.sender_id, req, res);
                        //         if (!msgPresentInDbForUserList[locationDetail.receiver_id])
                        //             msgPresentInDbForUserList[locationDetail.receiver_id] = true;
                        //         // console.log("Received location from" + locationDetail.sender_id);
                        //         if (err) {
                        //             log(0, "Database error: " + err);
                        //             log(3, "Calling locationSentSuccessfully(false).");
                        //             socket.emit("locationSentSuccessfully", [{ response: false }]);
                        //             return;
                        //         }
                        //         //Adding location_id as null (at client side we are expecting id).
                        //         locationDetail.location_id = 0;
                        //         // log(2, "Emiting receiveLocation (to notify sender for successful delivery). Sender id : " + locationDetail.sender_id);
                        //         // delete locationDetail.receiver_id;
                        //         // console.info("Emiting receiveLocation from shareLocation: " + locationDetail.receiver_id);
                        //         //Converting to array because oncheckNewReceivedMessage we can get message array (using same receiveLocation event)
                        //         socket.emit("receiveLocation", [locationDetail]);
                        //         log(3, "Calling locationSentSuccessfully(true). Sender id: " + locationDetail.sender_id);
                        //         socket.emit("locationSentSuccessfully", [{ response: true }]);
                        //         log(3, "Calling invokeCheckNewReceivedMessage. Receiver id: " + locationDetail.receiver_id);
                        //         socket.emit("invokeCheckNewReceivedMessage");
                        //     });
                        // // return res.status(200).end();
                        
               // res.status = function () { };
        // var toUserWebSocket = connectedUser[messageArray[0]]
        // if (toUserWebSocket) {
        //     console.log('sent to ' + toUserWebSocket + ': ' + JSON.stringify(message))
        //     //            messageArray[0] = userId
        //     toUserWebSocket.send(JSON.stringify(message));
        // }
        // fn(true);
 
 
 
//  pgOperation("SELECT L.LOCATION_ID,L.MESSAGE,L.SENDER_ID,L.CREATED_TIME,L.LATITUDE,L.LONGITUDE,L.STATUS,U1.MOBILE_NUMBER FROM USERS U1 "
//             + "INNER JOIN LOCATION L ON U1.USER_ID=L.SENDER_ID WHERE L.RECEIVER_ID=$1 AND L.STATUS=1;"
//             , [user_id], req, res, 'R', function (err, data, fields) {
//                 if (err) {
//                     log(0, "Database error: " + err);
//                     return;
//                 }
//                 // res.json();
//                 if (data.rows.length != 0) {
//                     log(2, "Emiting receiveLocation from checkNewReceivedMessage for user: " + user_id);
//                     // console.info("Emiting receiveLocation from checkNewReceivedMessage: " + user_id);
//                     socket.emit("receiveLocation", data.rows);
//                     var locationIds = [];
//                     for (var i = 0; i < data.rows.length; i++) {
//                         locationIds.push(data.rows[i].location_id);
//                     }
//                     pgOperation('UPDATE  LOCATION SET STATUS=2 WHERE STATUS=1 AND LOCATION_ID = ANY($1::int[]) ;'
//                         , [locationIds], req, res, 'C');
//                     delete msgPresentInDbForUserList[user_id];
//                     log(4, "Deleting from msgPresentInDbForUserList userid: " + user_id);

//                 }
//             });



// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
// { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }


//Handle uncaught exception
// process.on('uncaughtException', function (err) {
//     // console.error(err);
//     log(0, "UnCaughtException: " + err);
//     console.log("Node NOT Exiting...");
// });

// app.get('*.ico', function (req, res) {
// 	return res.end();
// });



// locationDetail.receiver_id = data.rows[0].user_id;
                        //Setting defalut value of status (1)
                        // locationDetail.status = 1;
                        // pgOperation("INSERT INTO LOCATION (SENDER_ID , RECEIVER_ID, MESSAGE , CREATED_TIME ,LATITUDE , LONGITUDE, STATUS) VALUES ($1,$2,$3,$4,$5,$6,$7);"
                        //     , [locationDetail.sender_id, locationDetail.receiver_id, locationDetail.message, locationDetail.created_time, locationDetail.latitude,
                        //         locationDetail.longitude, locationDetail.status], req, res, 'C',
                        //     function (err, data, fields) {
                        //         log(2, ":Id "+userId +" : Received location from userid: " + locationDetail.sender_id, req, res);
                        //         if (!msgPresentInDbForUserList[locationDetail.receiver_id])
                        //             msgPresentInDbForUserList[locationDetail.receiver_id] = true;
                        //         // console.log("Received location from" + locationDetail.sender_id);
                        //         if (err) {
                        //             log(0, "Database error: " + err);
                        //             log(3, ":Id "+userId +" : Calling locationSentSuccessfully(false).");
                        //             socket.emit("locationSentSuccessfully", [{ response: false }]);
                        //             return;
                        //         }
                        //         //Adding location_id as null (at client side we are expecting id).
                        //         locationDetail.location_id = 0;
                        //         // log(2, ":Id "+userId +" : Emiting receiveLocation (to notify sender for successful delivery). Sender id : " + locationDetail.sender_id);
                        //         // delete locationDetail.receiver_id;
                        //         // console.info("Emiting receiveLocation from shareLocation: " + locationDetail.receiver_id);
                        //         //Converting to array because oncheckNewReceivedMessage we can get message array (using same receiveLocation event)
                        //         socket.emit("receiveLocation", [locationDetail]);
                        //         log(3, ":Id "+userId +" : Calling locationSentSuccessfully(true). Sender id: " + locationDetail.sender_id);
                        //         socket.emit("locationSentSuccessfully", [{ response: true }]);
                        //         log(3, ":Id "+userId +" : Calling invokeCheckNewReceivedMessage. Receiver id: " + locationDetail.receiver_id);
                        //         socket.emit("invokeCheckNewReceivedMessage");
                        //     });
                        // // return res.status(200).end();
                        
               // res.status = function () { };
        // var toUserWebSocket = connectedUser[messageArray[0]]
        // if (toUserWebSocket) {
        //     console.log('sent to ' + toUserWebSocket + ': ' + JSON.stringify(message))
        //     //            messageArray[0] = userId
        //     toUserWebSocket.send(JSON.stringify(message));
        // }
        // fn(true);
 
 
 
//  pgOperation("SELECT L.LOCATION_ID,L.MESSAGE,L.SENDER_ID,L.CREATED_TIME,L.LATITUDE,L.LONGITUDE,L.STATUS,U1.MOBILE_NUMBER FROM USERS U1 "
//             + "INNER JOIN LOCATION L ON U1.USER_ID=L.SENDER_ID WHERE L.RECEIVER_ID=$1 AND L.STATUS=1;"
//             , [user_id], req, res, 'R', function (err, data, fields) {
//                 if (err) {
//                     log(0, "Database error: " + err);
//                     return;
//                 }
//                 // res.json();
//                 if (data.rows.length != 0) {
//                     log(2, ":Id "+userId +" : Emiting receiveLocation from checkNewReceivedMessage for user: " + user_id);
//                     // console.info("Emiting receiveLocation from checkNewReceivedMessage: " + user_id);
//                     socket.emit("receiveLocation", data.rows);
//                     var locationIds = [];
//                     for (var i = 0; i < data.rows.length; i++) {
//                         locationIds.push(data.rows[i].location_id);
//                     }
//                     pgOperation('UPDATE  LOCATION SET STATUS=2 WHERE STATUS=1 AND LOCATION_ID = ANY($1::int[]) ;'
//                         , [locationIds], req, res, 'C');
//                     delete msgPresentInDbForUserList[user_id];
//                     log(4, ":Id "+userId +" : Deleting from msgPresentInDbForUserList userid: " + user_id);
//                 }
//             });