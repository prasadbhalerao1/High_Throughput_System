import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import path from "node:path";

async function main() {
    const PORT = process.env.PORT ?? 3000;

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

    io.attach(server);

    io.on("connection", (socket) => {
        console.log(`[Socket:${socket.id}] connected!`);

        socket.on("client:location:update", (locationData) => {
            const { latitude, longitude } = locationData;
            console.log(
                `[Socket:${socket.id}]:client:location:update`,
                locationData,
            );
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
