import { Kafka } from "kafkajs";

export const kafkaClient = new Kafka({
    clientId: "location-sharing-app",
    brokers: ["localhost:9092"],
});
