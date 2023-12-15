const express = require("express"),
  app = express(),
  port = 3000,
  bodyParser = require("body-parser");
const server = require("http").createServer(app);
const io = require("socket.io")(4200, { cors: { origin: "*" } });
const poll = require("./poll.js");
module.exports.ioObject = io;
require("dotenv").config();

// DB CONNECTION
const mongoString = process.env.DATABASE_URL;
const secretKey = process.env.SECRET_KEY;
const autoPollPeriod = process.env.AUTO_POLL_PERIOD;
// LOG VIEWING
const morgan = require("morgan");
const session = require("express-session");

app.use(
  session({
    secret: secretKey, // This is a secret key used to sign the session ID cookie
    resave: false, // Forces the session to be saved back to the session store
    saveUninitialized: false, // Forces a session that is "uninitialized" to be saved to the store
    cookie: { secure: false }, // Set true if you are using https, false otherwise
  })
);

// CRON JOBBING
/* var cron = require('node-cron');

cron.schedule('5 * * * * *', () => {
    console.log('running a task every five seconds');

}); */

// ENV FILE USE
const mongoose = require("mongoose");
mongoose
  .connect(mongoString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-Type", "application/json");
  next();
});
const routes = require("./routes.js");
app.use("/api", routes);

app.get("/", (req, res) =>
  res.send(
    "OneAir Vari-D Controller. Please use the API to interact with the server!"
  )
);
app.get("/pippo/", function (req, res) {
  const modbus = require("modbus-stream");
  let modPort = 502;
  let host = "192.168.1.254";
  let deviceId = 1;
  let address = 4;
  let quantity = 4;
  let openPerc;
  let mydata;
  let mydata2;
  let mydata3;
  console.log("modbus scanning...");
  // console.log(req);
  // modbus logging

  modbus.tcp.connect(
    modPort,
    host,
    {
      debug: "automaton-2454",
    },
    (err, connection) => {
      if (err) {
        throw err;
      } else {
        console.log("connected");
        connection.readHoldingRegisters(
          {
            address,
            quantity,
            extra: { unitId: deviceId },
          },
          (err, resp) => {
            if (err) throw err;

            //console.log(res);
            mydata = resp.response.data;
            //console.log(mydata);
            // response
            mydata2 = resp.pdu;
            console.log(mydata2);
            //for (const dataKey in mydata) {
            //  console.log(mydata[dataKey]);
            //}
            console.log(mydata);
            mydata2 = mydata[0].readUInt16BE();

            mydata3 = "GET request made. Apertura buffer " + mydata2;
            console.log(mydata3);
            /*let myvalue  = Buffer.allocUnsafe(2);
                    myvalue.writeUInt16BE(8000);  // Big endian
                    console.log('Buffer in scrittura:');
                    console.log(myvalue);
                    connection.writeSingleRegister ({
                        address,
                        value: Buffer.from([0x00, 0xA0]),
                        extra: { unitId: deviceId }
                    }, (err,resp) => {
                        console.log('next');
                        console.log(resp);
                    } );*/
          }
        );
      }
    }
  );
  res.send(mydata3);
});

setInterval(poll.pollDevices, autoPollPeriod);

app.listen(port, () =>
  console.log(`Vari-D Controller up&running -> Port: ${port}!`)
);
