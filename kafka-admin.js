import { kafkaClient } from "./kafka-client.js";

async function setup() {
    const admin = kafkaClient.admin();

    console.log(`Kafka Admin Connecting ...`);

    await admin.connect();

    console.log(`Kafka Admin Connected!`);

    await admin.createTopics({
        topics: [
            {
                topic: "location-updates",
                numPartitions: 2,
            },
        ],
    });

    console.log(`Kafka Admin Disconnecting ...`);

    await admin.disconnect();
}

setup();
