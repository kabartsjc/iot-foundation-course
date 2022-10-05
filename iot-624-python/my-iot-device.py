import asyncio
import random
import uuid

from azure.iot.device import Message
from azure.iot.device.aio import IoTHubDeviceClient

#variables
degradation = 0
deviceId= 'my-iiot-device'
messages_to_send = 10

async def main():
    # Fetch the connection string from an environment variable
    conn_str = "HostName=iot-hub-624.azure-devices.net;DeviceId=iot-device-001;SharedAccessKey=n5z+qMpRnlEc4cS+R8ltT4jBksFAGiOrMpHL4gQ4Mwc="

    # Create instance of the device client using the authentication provider
    device_client = IoTHubDeviceClient.create_from_connection_string(conn_str)

    # Connect the device client.
    await device_client.connect()

    async def sendTemperatureMeasurement(i):
        print("sending message #" + str(i))
        msg = Message("temperature measurement -  " + deviceId)
        msg.message_id = uuid.uuid4()
        msg.correlation_id = "correlation-1234"
        msg.content_encoding = "utf-8"
        msg.content_type = "application/json"

        temperature = 20 + (random.randint(0, 100) * 4)
        msg.custom_properties["temperature"] = temperature

        flow = 60 + (random.randint(0, 100) * temperature) - degradation
        msg.custom_properties["flow"] = flow

        await device_client.send_message(msg)
        print("done sending message #" + str(i))

    # send `messages_to_send` messages in parallel
    await asyncio.gather(*[sendTemperatureMeasurement(i) for i in range(1, messages_to_send + 1)])

    # finally, shut down the client
    await device_client.shutdown()

if __name__ == "__main__":
    asyncio.run(main())