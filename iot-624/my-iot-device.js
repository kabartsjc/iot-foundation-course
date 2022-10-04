'use strict';
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var connectionString = "HostName=iot-hub-624.azure-devices.net;DeviceId=iot-device-001;SharedAccessKey=n5z+qMpRnlEc4cS+R8ltT4jBksFAGiOrMpHL4gQ4Mwc=";
var client = Client.fromConnectionString(connectionString, Protocol);
var degradation = 0;
   
function sendTemperatureMeausurement(){
  degradation += 0.01;
  var temperature = 20 + (Math.random() * 4);
  var flow = 60 + (Math.random() * temperature) - degradation;
  var data = JSON.stringify({ deviceId: 'my-iiot-device', temperature: temperature, flow: flow, ts: new Date() });
  var message = new Message(data);
  message.properties.add('temperatureAlert', (temperature > 21) ? 'true' : 'false');
  console.log('Sending message: ' + message.getData());
  client.sendEvent(message, printResultFor('send'));
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

function defineMessage (){
  var msg = client.msg
  console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);

}

function connectCallback(err){
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');
    client.on('message', function (msg) {
      console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
      // When using MQTT the following line is a no-op.
      client.complete(msg, printResultFor('completed'));
    });
    var sendInterval = setInterval(sendTemperatureMeausurement, 2000);
    client.on('error', function (err) {
      console.error(err.message);
    });
    client.on('disconnect', function () {
      clearInterval(sendInterval);
      client.removeAllListeners();
      client.open(connectCallback);
    });
  }
}


client.open(connectCallback);
