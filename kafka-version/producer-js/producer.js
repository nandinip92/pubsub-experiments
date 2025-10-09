import express from "express";
import { Kafka } from "kafkajs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Kafka configuration
const kafka = new Kafka({
  clientId: "news-producer",
  brokers: ["localhost:9092"],
});
const producer = kafka.producer();
const admin = kafka.admin();
await admin.connect();

const TOPIC = "news-topic";

// Create topic if it doesn't exist
const topics = await admin.listTopics();
if (!topics.includes(TOPIC)) {
  await admin.createTopics({
    topics: [{ topic: TOPIC, numPartitions: 1, replicationFactor: 1 }],
  });
  console.log(`✅ Topic '${TOPIC}' created`);
} else {
  console.log(`ℹ️ Topic '${TOPIC}' already exists`);
}
await admin.disconnect();
await producer.connect();
console.log("✅ Producer connected to Kafka!");

// Health check route
app.get("/", (req, res) => res.send({ status: "Producer is running!" }));

// POST endpoint to publish messages
app.post("/publish", async (req, res) => {
  const { message } = req.body;
  await producer.send({ topic: TOPIC, messages: [{ value: message }] });
  console.log("📤 Published:", message);
  res.send({ status: "Message published!" });
});

// Start server
app.listen(4002, () =>
  console.log("🚀 Kafka producer running at http://localhost:4002")
);
