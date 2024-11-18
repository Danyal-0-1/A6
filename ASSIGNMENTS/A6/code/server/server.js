const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;

const hostname = "0.0.0.0";
const port = 8080;
const connectionString = "mongodb://localhost:27017";

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Default Route
app.get("/", function (req, res) {
    res.redirect("/index.html");
});

// Endpoint: Get latest data (most recent 10 records)
app.get("/getLatest", async function (req, res) {
    try {
        const client = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db("sensorData");

        const result = await db.collection("data").find().sort({ time: -1 }).limit(10).toArray();
        client.close();

        res.json(result); // Send JSON response
    } catch (error) {
        console.error("Error fetching latest data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

// Endpoint: Get historical data
app.get("/getData", async function (req, res) {
    const from = parseInt(req.query.from);
    const to = parseInt(req.query.to);

    if (isNaN(from) || isNaN(to)) {
        res.status(400).send({ error: "Invalid 'from' or 'to' parameters" });
        return;
    }

    try {
        const client = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db("sensorData");

        const result = await db.collection("data").find({ time: { $gte: from, $lte: to } }).toArray();
        client.close();

        res.json(result || []); // Send JSON response or empty array
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

// Endpoint: Set a new value
app.get("/setValue", async function (req, res) {
    const VALUEt = parseFloat(req.query.t);
    const VALUEh = parseFloat(req.query.h);
    const VALUEtime = new Date().getTime();

    if (isNaN(VALUEt) || isNaN(VALUEh)) {
        res.status(400).send({ error: "Invalid temperature or humidity values" });
        return;
    }

    const dataObj = { t: VALUEt, h: VALUEh, time: VALUEtime };

    try {
        const client = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
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

console.log(`Server running at http://${hostname}:${port}`);
app.listen(port);
