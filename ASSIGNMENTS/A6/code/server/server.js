var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var methodOverride = require("method-override");
var hostname = process.env.HOSTNAME || "localhost";
var port = 8080;
var VALUEt = 0;
var VALUEh = 0;
var VALUEtime = 0;

let MongoClient = require("mongodb").MongoClient;
const connectionString = "mongodb://localhost:27017";

app.get("/", function (req, res) {
    res.redirect("/index.html");
});

// Endpoint: Get average temperature and humidity
app.get("/getAverage", async function (req, res) {
    const from = parseInt(req.query.from);
    const to = parseInt(req.query.to);

    if (isNaN(from) || isNaN(to)) {
        res.status(400).send({ error: "Invalid 'from' or 'to' parameters" });
        return;
    }

    try {
        const client = await MongoClient.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = client.db("sensorData");

        const results = await db.collection("data").find({ time: { $gte: from, $lte: to } }).toArray();
        client.close();

        if (!results.length) {
            res.json({ tAvg: 0, hAvg: 0 });
            return;
        }

        const tempSum = results.reduce((sum, entry) => sum + (entry.t || 0), 0);
        const humSum = results.reduce((sum, entry) => sum + (entry.h || 0), 0);

        const tAvg = tempSum / results.length;
        const hAvg = humSum / results.length;

        res.json({ tAvg, hAvg });
    } catch (error) {
        console.error("Error fetching average data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

// Endpoint: Get latest data
app.get("/getLatest", async function (req, res) {
    try {
        const client = await MongoClient.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = client.db("sensorData");

        const result = await db.collection("data").find().sort({ time: -1 }).limit(10).toArray();
        client.close();

        res.json(result);
    } catch (error) {
        console.error("Error fetching latest data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

// Endpoint: Get data between a specific time range
app.get("/getData", async function (req, res) {
    const from = parseInt(req.query.from);
    const to = parseInt(req.query.to);

    if (isNaN(from) || isNaN(to)) {
        res.status(400).send({ error: "Invalid 'from' or 'to' parameters" });
        return;
    }

    try {
        const client = await MongoClient.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = client.db("sensorData");

        const result = await db.collection("data").find({ time: { $gte: from, $lte: to } }).toArray();
        client.close();

        res.json(result || []);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

// Endpoint: Get current values
app.get("/getValue", function (req, res) {
    res.send(`${VALUEt} ${VALUEh} ${VALUEtime}\r`);
});

// Endpoint: Set temperature, humidity, and time values
app.get("/setValue", async function (req, res) {
    VALUEt = parseFloat(req.query.t);
    VALUEh = parseFloat(req.query.h);
    VALUEtime = new Date().getTime();

    if (isNaN(VALUEt) || isNaN(VALUEh)) {
        res.status(400).send({ error: "Invalid temperature or humidity values" });
        return;
    }

    const dataObj = { t: VALUEt, h: VALUEh, time: VALUEtime };

    try {
        const client = await MongoClient.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = client.db("sensorData");

        const result = await db.collection("data").insertOne(dataObj);
        console.log("Data inserted:", result.insertedId);

        client.close();
        res.send(VALUEtime.toString());
    } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

// Middleware
app.use(methodOverride());
app.use(bodyParser.json()); // Use bodyParser for JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(errorHandler());

console.log(`Simple static server listening at http://${hostname}:${port}`);
app.listen(port);
