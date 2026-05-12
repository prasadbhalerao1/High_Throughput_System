import http from "node:http";
import path from "node:path";
import express from "express";
import { Server } from "socket.io";
import { kafkaClient } from "./kafka-client.js";

async function main() {
    const PORT = process.env.PORT ?? 3000;

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

    const kafkaProducer = kafkaClient.producer();

    await kafkaProducer.connect();

    const kafkaConsumer = kafkaClient.consumer({
        groupId: `socket-server-${PORT}`,
    });
    await kafkaConsumer.connect();

    await kafkaConsumer.subscribe({
        topic: "location-updates",
        fromBeginning: true,
    });

    await kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat }) => {
            const data = JSON.parse(message.value.toString());

            console.log("Kafka Consumer Data Received", data);
            io.emit("server:location:update", {
                id: data.id,
                latitude: data.latitude,
                longitude: data.longitude,
            });

            await heartbeat();
        },
    });

    io.attach(server);

    io.on("connection", (socket) => {
        console.log(`[Socket:${socket.id}] connected!`);

        socket.on("client:location:update", (locationData) => {
            const { latitude, longitude } = locationData;
            console.log(
                `[Socket:${socket.id}]:client:location:update`,
                locationData,
            );

            // Using socket.id as the key ensures that all location updates for
            // a specific user land in the same Kafka partition, preserving their order.
            // Same Socket Id -> Same Hash -> Same Partition
            kafkaProducer.send({
                topic: "location-updates",
                messages: [
                    {
                        key: socket.id,
                        value: JSON.stringify({
                            id: socket.id,
                            latitude,
                            longitude,
                        }),
                    },
                ],
            });
        });
    });

    app.use(express.static(path.resolve("./public")));

    app.get("/health", (req, res) => {
        return res.json({ healthy: true });
    });

    server.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
}

main();
