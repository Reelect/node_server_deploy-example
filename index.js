const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

// check port environment variable
if (!process.env.PORT) {
  throw new Error(
    "Please specify the port number for the HTTP server with the environment variable PORT."
  );
}

// get port environment variable
const PORT = process.env.PORT;

// Registers a HTTP GET route.
// ref: https://betterprogramming.pub/video-stream-with-node-js-and-html5-320b3191a6b6
app.get("/video", (req, res) => {
  const path = "./videos/SampleVideo_1280x720_1mb.mp4";
  fs.stat(path, (err, stats) => {
    if (err) {
      console.error("An error occurred ");
      res.sendStatus(500);
      return;
    }

    res.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(path).pipe(res);
  });
});

// Starts the HTTP server.
app.listen(PORT, () => {
  console.log(
    `Microservice listening on port ${PORT}, point your browser at http://localhost:${PORT}/video`
  );
});
