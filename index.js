const fs = require('fs');
const http = require('http');
const https = require('https');
const taskDb = require('./task_db');
const moment = require('moment');



var hollywood = "80007998";
var magicKingdom = "80007944";
var epcot = "80007838";
var animalKingdom = "80007823";

var uiHtml = "";

fs.readFile('./ui.html', function (err, html) {
    if (err) {
        throw err;
    }
    uiHtml = html;
})

//create a server object:
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' }); //http header 

    var url = req.url;
    console.log(url);
    if (url === '/about') { //describe the url ending you want
        res.write('about'); //write response (html goes here)
        res.end; //end the response
    } else if (url === '/caller') {
        if (req.method === "POST") {

            var body = "";
            req.on("data", function (chunk) {
                body += chunk;
            });


            req.on("end", async function () {
                var post = JSON.parse(body);
                taskDb.addJob(post.park, post.start, post.end, post.passtype, post.NotifYN);
                // checkAvailability(post.start, post.end, post.passtype, post.park, function(aval){


                //     res.writeHead(200, { "Content-Type": "text/html" });
                //     res.end(JSON.stringify(aval));
                // });
                checkJobs();
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(JSON.stringify(showJobs()));
            });


        }

    } else if (url === '/delete') {
        if (req.method === 'POST') {
            var body = "";

            req.on("data", function (chunk) {
                body += chunk;
            });


            req.on("end", async function () {
                var post = JSON.parse(body);
                taskDb.deleteDatabaseEntry(post.id);
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(JSON.stringify(showJobs()));
            });
        }

    } else if (url === '/getJobs') {

        if (req.method === 'GET') {
            req.on("data", function (chunk) {
                body += chunk;
            });


            req.on("end", async function () {
                checkJobs();
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(JSON.stringify(showJobs()));
            });
        }

    } else {
        res.write(uiHtml); //write a response
        res.end(); //end the response
    }

}).listen(3001, function () {
    console.log("server start at port 3001"); //the server object listens on port 3000
});



function checkJobs() {

    var taskList = taskDb.listAll();

    for (const [key, val] of Object.entries(taskList)) {
        console.log(key);
        checkAvailability(key, val['start'], val['end'], val['passType'], val['park'], function (cb) {
            taskDb.updateDatabaseEntry(key, "availability", cb);
        });

    }
}

function showJobs() {

    return taskDb.listAll();


}


async function checkAvailability(jobId, startDate, endDate, passtype, hopefullyOpen, cb) {

    var parkCode = parkCodeFromName(hopefullyOpen);
    var parkOpenData = {};
    let availabilityMap = {};

    const options = {
        hostname: 'disneyworld.disney.go.com',
        port: 443,
        path: '/availability-calendar/api/calendar?segment=' + passtype + '&startDate=' + startDate + '&endDate=' + endDate,
        method: 'GET'
    }

    const req = https.request(options, res => {

        res.on('data', d => {
            // process.stdout.write(d);
            var dates = JSON.parse(d);

            for (const [key, data] of Object.entries(dates)) {
                var parkOpen = false;

                var date = data['date'];
                var availability = data['availability'];
                var parks = data['parks'];

                if (availability == 'full') {
                    parkOpen = true;
                } else if (availability == 'partial') {
                    parks.forEach(park => {
                        if (park == parkCode) {
                            parkOpen = true;
                        }
                    });
                }
                availabilityMap[data["date"]] = parkOpen;
            }

            parkOpenData = {
                'park': parkCode,
                'dates': availabilityMap,
                'pass': passtype,
            };

            for (const [date, value] of Object.entries(availabilityMap)) {
                if (value == true) {
                    sendNotification(jobId, parkOpenData);
                    break
                }
            }


            // cb(parkOpenData);
            cb(availabilityMap);

        })
    })

    req.on('error', error => {
        console.error(error)
    })
    req.end();
}




function sendNotification(jobId, parkOpenData) {
    console.log('notifier');
    console.log("ID: " + jobId + " ||| ParkName: " + parkOpenData['park']);

    var parkCode = parkOpenData['park'];
    var park = nameFromParkCode(parkCode);

    var job = taskDb.readDatabaseEntry(jobId);

    if (job['NotifYN'] == true) {
        console.log("cehcking last notif time");
        if (moment(job['lastNotif']).isBefore(moment().subtract(1, 'hours')) || job['lastNotif'] == "") {


            var dates = parkOpenData['dates'];
            var dateList = "";

            for (const [date, bool] of Object.entries(dates)) {
                if (bool == true) {
                    if (dateList == "") {
                        dateList += date;
                    } else {
                        dateList += " ," + date;
                    }
                }
            }

            const data = JSON.stringify({
                value1: park,
                value2: dateList,
                value3: parkOpenData['pass']
            })

            console.log('Notification Fired')

            taskDb.updateDatabaseEntry(jobId, "lastNotif", Date.now());
        }
    }

}


function parkCodeFromName(hopefullyOpen) {
    if (hopefullyOpen == "hollywood") {
        return hollywood
    } else if (hopefullyOpen == "magicKingdom") {
        return magicKingdom;
    } else if (hopefullyOpen == "epcot") {
        return epcot;
    } else if (hopefullyOpen == "animalKingdom") {
        return animalKingdom;
    }
}

function nameFromParkCode(parkCode) {
    if (parkCode == magicKingdom) {
        return 'Magic Kingdom'
    } else if (parkCode == epcot) {
        return 'EPCOT';
    } else if (parkCode == animalKingdom) {
        return 'Animal Kingdom'
    } else if (parkCode == hollywood) {
        return 'Hollywood Studios';
    }
}