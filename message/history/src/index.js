const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const amqp = require("amqplib");

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

if (!process.env.RABBIT) {
  throw new Error(
    "Please specify the name of the RabbitMQ host using environment variable RABBIT"
  );
}

const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

//
// Connect to the database.
//
function connectDb() {
  return mongodb.MongoClient.connect(DBHOST).then((client) => {
    return client.db(DBNAME);
  });
}

//
// Connect to the RabbitMQ server.
//
function connectRabbit() {
  console.log(`Connecting to RabbitMQ server at ${RABBIT}.`);

  return amqp.connect(RABBIT).then((messageConnection) => {
    console.log("Connected to RabbitMQ server.");
    return messageConnection.createChannel(); // Create a RabbitMQ messaging channel.
  });
}

function selfHandlers(app, db, messageChannel) {
  const videosCollection = db.collection("videos");

  function consumeViewedMessage(msg) {
    console.log("Recieved a 'view' message");

    const parseMsg = JSON.parse(msg.content.toString());

    return videosCollection
      .insertOne({ videoPath: parseMsg.videoPath })
      .then(() => {
        console.log("Acknowledging message was handled");

        messageChannel.ack(msg);
      });
  }

  return messageChannel
    .assertExchange("viewed", "fanout") // Assert that we have a "viewed" exchange.
    .then(() => {
      return messageChannel.assertQueue("", { exclusive: true }); // Create an anonyous queue.
    })
    .then((response) => {
      const queueName = response.queue;
      console.log(
        `Created queue ${queueName}, binding it to "viewed" exchange.`
      );
      return messageChannel
        .bindQueue(queueName, "viewed", "") // Bind the queue to the exchange.
        .then(() => {
          return messageChannel.consume(queueName, consumeViewedMessage); // Start receiving messages from the anonymous queue.
        });
    });
}

function startHttpServer(db, messageChannel) {
  return new Promise((resolve) => {
    const app = express();
    selfHandlers(app, db, messageChannel);

    const port = (process.env.PORT && parseInt(process.env.PORT)) || 3000;
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}

function main() {
  console.log("Hello world!");

  return connectDb() // Connect to the database...
    .then((db) => {
      // then...
      return connectRabbit() // connect to RabbitMQ...
        .then((messageChannel) => {
          // then...
          return startHttpServer(db, messageChannel); // start the HTTP server.
        });
    });
}

main()
  .then(() => {
    console.log("Microservice started successfully");
  })
  .catch((err) => {
    console.error("Microservice failed to start");
    console.error((err && err.stack) || err);
  });
