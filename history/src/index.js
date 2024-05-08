const express = require("express");

function selfHandlers(app) {}

function startHttpServer() {
  return new Promise((resolve, reject) => {
    const app = express();
    selfHandlers(app);

    const port = (process.env.PORT && parseInt(process.env.PORT)) || 3000;
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}

function main() {
  console.log("Hello World!");

  return startHttpServer();
}

main()
  .then(() => {
    console.log("Microservice started successfully");
  })
  .catch((err) => {
    console.error("Microservice failed to start");
    console.error((err && err.stack) || err);
  });
