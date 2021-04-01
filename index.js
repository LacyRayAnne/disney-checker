const fs = require('fs');
const http = require('http');
const https = require('https');
const taskDb = require('./task_db');




var hollywood = "80007998";
var magicKingdom = "80007944";
var epcot = "80007838";
var animalKingdom = "80007823";

var uiHtml = "";

fs.readFile('./ui.html', function(err,html){
    if (err) {
        throw err;
    } 
    uiHtml = html;
})

//create a server object:
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'}); //http header 

    var url = req.url;
    console.log(url);
    if (url ==='/about'){ //describe the url ending you want
        res.write('about'); //write response (html goes here)
        res.end; //end the response
    } else if (url === '/caller') {
        if (req.method === "POST"){        

            var body = "";
            req.on("data", function (chunk) {
                body += chunk;
            });

    
            req.on("end", async function(){
                var post = JSON.parse(body);
                checkAvailability(post.start, post.end, post.passtype, post.park, function(aval){


                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(JSON.stringify(aval));
                });
            });


        }
        
    } else {
        res.write(uiHtml); //write a response
        res.end(); //end the response
    }

  }).listen(3000, function(){
   console.log("server start at port 3000"); //the server object listens on port 3000
  });



  

async function checkAvailability(startDate, endDate, passtype, hopefullyOpen, cb) {
    
    console.log(hopefullyOpen);
    if (hopefullyOpen == "hollywood") {
        var parkCode = hollywood
    } else if (hopefullyOpen == "magicKingdom") {
        var parkCode = magicKingdom;
    } else if ( hopefullyOpen == "epcot") {
        var parkCode = epcot;
    } else if (hopefullyOpen == "animalKingdom") {
        var parkCode = animalKingdom;
    }
    console.log(parkCode);
    
    var parkOpenData = {};
    let availabilityMap = {};

    const options = {
        hostname: 'disneyworld.disney.go.com',
        port: 443,
        path: '/availability-calendar/api/calendar?segment=' + passtype + '&startDate=' + startDate + '&endDate=' + endDate,
        method: 'GET'
    }

    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            process.stdout.write(d);
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
            console.log(parkOpenData);

            for (const [date, value] of Object.entries(availabilityMap)) {
                if (value == true) {
                    sendNotification(parkOpenData);
                    break
                }
            }

            
            cb(parkOpenData);

        })
    })

    req.on('error', error => {
        console.error(error)
    })
    req.end();
}




function sendNotification(parkOpenData) {

    var parkCode = parkOpenData['park'];
    if (parkCode == magicKingdom) {
        var park = 'Magic Kingdom'
    } else if (parkCode == epcot) {
        var park = 'EPCOT';
    } else if (parkCode == animalKingdom) {
        var park = 'Animal Kingdom'
    } else if (parkCode == hollywood) {
        var park = 'Hollywood Studios';
    }



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

    const iftttUrl = {
        hostname: 'maker.ifttt.com',
        port: 443,
        path: '/trigger/disney_checker/with/key/[KEYHERE]',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const req = https.request(iftttUrl, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
          process.stdout.write(d)
        })
      })

      req.on('error', error => {
        console.error(error)
      })

      req.write(data)
      req.end()

}