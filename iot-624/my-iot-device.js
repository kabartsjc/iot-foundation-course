'use strict';
var Protocol = require('azure-iot-device-mqtt').Mqtt;
 var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
 var connectionString = "HostName=iottutorialhub01.azure-devices.net;DeviceId=iotdev01;SharedAccessKey=uzwOMaL9x89SN/g4itttk1Gnwj4ZlatczuLvcwZI594=";
 var client = Client.fromConnectionString(connectionString, Protocol);
var connectCallback = function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');
    client.on('message', function (msg) {
      console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
      // When using MQTT the following line is a no-op.
      client.complete(msg, printResultFor('completed'));
    });
    var degradation=0;
    var sendInterval = setInterval(function () {
        degradation += 0.01;
        var temperature = 20 + (Math.random() * 4); 
        var flow = 60 + (Math.random() * temperature) - degradation; 
        var data = JSON.stringify({ deviceId:'my-iiot-device', temperature: temperature, flow: flow, ts: new Date() });
        var message = new Message(data);
        message.properties.add('temperatureAlert', (temperature > 21) ? 'true' : 'false');
        console.log('Sending message: ' + message.getData());
        client.sendEvent(message, printResultFor('send'));
      }, 2000);
      client.on('error', function (err) {
        console.error(err.message);
      });
      client.on('disconnect', function () {
        clearInterval(sendInterval);
        client.removeAllListeners();
        client.open(connectCallback);
      });
    }
  };
  client.open(connectCallback);
  // Helper function to print results in the console
  function printResultFor(op) {
    return function printResult(err, res) {
      if (err) console.log(op + ' error: ' + err.toString());
      if (res) console.log(op + ' status: ' + res.constructor.name);
    };
  }
