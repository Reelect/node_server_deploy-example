const express = require("express");
const http = require("http");
const mongodb = require("mongodb");

const app = express();

// check port environment variable
if (!process.env.PORT) {
  throw new Error(
    "Please specify the port number for the HTTP server with the environment variable PORT."
  );
}

if (!process.env.VIDEO_STORAGE_HOST) {
  throw new Error(
    "Please specify the host name for the video storage microservice in variable VIDEO_STORAGE_HOST."
  );
}

if (!process.env.VIDEO_STORAGE_PORT) {
  throw new Error(
    "Please specify the port number for the video storage microservice in variable VIDEO_STORAGE_PORT."
  );
}

if (!process.env.DBHOST) {
  throw new Error(
    "Please specify the databse host using environment variable DBHOST."
  );
}

if (!process.env.DBNAME) {
  throw new Error(
    "Please specify the name of the database using environment variable DBNAME"
  );
}

// get environment variable
const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

console.log(
  `Forwarding video requests to ${VIDEO_STORAGE_HOST}:${VIDEO_STORAGE_PORT}.`
);

function main() {
  return mongodb.MongoClient.connect(DBHOST).then((client) => {
    const db = client.db(DBNAME);
    const videosCollection = db.collection("videos");

    // Registers a HTTP GET route.
    app.get("/video", (req, res) => {
      const videoId = new mongodb.ObjectID(req.query.id);
      videosCollection
        .findOne({ _id: videoId })
        .then((videoRecord) => {
          if (!videoRecord) {
            res.sendStatus(404);
            return;
          }

          const forwardRequest = http.request(
            {
              host: VIDEO_STORAGE_HOST,
              port: VIDEO_STORAGE_PORT,
              path: `/video?path=${videoRecord.videoPath}`,
              method: "GET",
              headers: req.headers,
            },
            (forwardResponse) => {
              res.writeHeader(
                forwardResponse.statusCode,
                forwardResponse.headers
              );
              forwardResponse.pipe(res);
            }
          );
          req.pipe(forwardRequest);
        })
        .catch((err) => {
          console.error("Database query failed.");
          console.error((err && err.stack) || err);
          res.sendStatus(500);
        });
    });

    // Starts the HTTP server.
    app.listen(PORT, () => {
      console.log(
        `Microservice listening, please load the data file db-fixture/videos.json into your database before testing this microservice.`
      );
    });
  });
}

main()
  .then(() => console.log("Center Microservice online"))
  .catch((err) => {
    console.error("Microservice failed to start.");
    console.error((err && err.stack) || err);
  });
