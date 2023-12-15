const express = require('express'),
    app = express(),
    port = 3000,
    bodyParser = require('body-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(4200, {cors: {origin:'*'}});
module.exports.ioObject = io;
// LOG VIEWING
const morgan = require ('morgan');

// CRON JOBBING
/* var cron = require('node-cron');

cron.schedule('5 * * * * *', () => {
    console.log('running a task every five seconds');

}); */

// ENV FILE USE
require('dotenv').config();

// DB CONNECTION
const mongoString = process.env.DATABASE_URL;
const mongoose = require ('mongoose');
mongoose.connect(mongoString);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})


app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Content-Type', 'application/json');
    next();
});
const routes = require('./routes.js');
app.use('/api', routes);


app.get('/', (req, res) => res.send('OneAir Vari-D Controller. Please use the API to interact with the server!'))
app.get('/pippo/', function(req, res){
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
    console.log('modbus scanning...');
    // console.log(req);
    // modbus logging


    modbus.tcp.connect(
        modPort,
        host,
        {
            debug: "automaton-2454"
        },
        (err, connection) => {
            if (err) {
                throw err;
            } else {
                console.log('connected');
                connection.readHoldingRegisters({
                    address,
                    quantity,
                    extra: { unitId: deviceId }
                }, (err,resp) => {
                    if (err) throw err;

                    //console.log(res);
                    mydata = resp.response.data;
                    //console.log(mydata);
                    // response
                    mydata2=resp.pdu ;
                    console.log(mydata2);
                    //for (const dataKey in mydata) {
                    //  console.log(mydata[dataKey]);
                    //}
                    console.log(mydata);
                    mydata2 = mydata[0].readUInt16BE();

                    mydata3 = 'GET request made. Apertura buffer ' + mydata2;
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

                });



            }

        });
    res.send(mydata3)
})


app.listen(port, () => console.log(`Vari-D Controller up&running -> Port: ${port}!`))