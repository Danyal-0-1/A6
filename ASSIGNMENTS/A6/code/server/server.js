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

// Endpoint: Get historical data
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

        console.log("Querying database from:", from, "to:", to);
        const result = await db
            .collection("data")
            .find({ time: { $gte: from, $lte: to } })
            .toArray();
        client.close();

        console.log("Query result:", result);
        res.json(result || []); // Return an empty array if no data
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

console.log(`Server running at http://${hostname}:${port}`);
app.listen(port);
