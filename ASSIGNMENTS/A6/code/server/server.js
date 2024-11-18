var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 8080;
var VALUEt = 0;
var VALUEh = 0;
var VALUEtime = 0;

let MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://localhost:27017';


app.get("/", function (req, res) {
    res.redirect("/index.html");
});

app.get("/getAverage", function (req, res) {
  var from = parseInt(req.query.from);
  var to = parseInt(req.query.to);
  db.collection("dataWeather").find({time:{$gt:from, $lt:to}}).toArray(function(err, result){
  	console.log(err);
  	console.log(result);
  	var tempSum = 0;
  	var humSum = 0;
  	for(var i=0; i< result.length; i++){
  		tempSum += result[i].t || 0;
  		humSum += result[i].t || 0;
  	}
  	var tAvg = tempSum/result.length;
  	var hAvg = humSum/result.length;
  	res.send(tAvg + " "+  hAvg);
  });
});

app.get("/getLatest", function (req, res) {
  (async function() {
    let client = await MongoClient.connect(connectionString,
      { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      let result = await db.collection("data").find().sort({time:-1}).limit(10).toArray();
      res.send(JSON.stringify(result));
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});
app.get("/getData", async function (req, res) {
  const from = parseInt(req.query.from); // Start of time range
  const to = parseInt(req.query.to);     // End of time range

  // Check for valid query parameters
  if (isNaN(from) || isNaN(to)) {
    res.status(400).send({ error: "Invalid 'from' or 'to' parameters" });
    return;
  }

  // Connect to MongoDB and query the database
  try {
    const client = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db("sensorData"); // Replace "sensorData" with your database name if different

    // Query the database for data within the given time range
    const result = await db
      .collection("data")
      .find({ time: { $gte: from, $lte: to } })
      .sort({ time: 1 }) // Sort results by time in ascending order
      .toArray();

    // Close the database connection
    client.close();

    // Send the result back as JSON
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});



app.get("/getValue", function (req, res) {
  //res.writeHead(200, {'Content-Type': 'text/plain'});
  res.send(VALUEt.toString() + " " + VALUEh + " " + VALUEtime + "\r");
});

app.get("/setValue", function (req, res) {
  VALUEt = parseFloat(req.query.t);
  VALUEh = parseFloat(req.query.h);
  VALUEtime = new Date().getTime();
	var dataObj = {
		t: VALUEt,
		h: VALUEh,
		time: VALUEtime
	}
  res.send(VALUEtime.toString());
  (async function() {
    let client = await MongoClient.connect(connectionString,
      { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      result = await db.collection("data").insertOne(dataObj);
      if(result.insertedId) {
        result = result.insertedId.toString();
        console.log(result);
      }
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});


app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port);
