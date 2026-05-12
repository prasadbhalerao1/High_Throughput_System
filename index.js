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

    app.use(express.static(path.resolve("./public")));

    app.get("/health", (req, res) => {
        return res.json({ healthy: true });
    });

    server.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
}

main();
