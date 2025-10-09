import express from "express";
import amqp from "amqplib";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "news-exchange";
let channel;

// Connect to RabbitMQ and create fanout exchange
async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });
  console.log("Connected to RabbitMQ and exchange created");
}
connectRabbitMQ();

// Health check route
app.get("/", (req, res) => {
  res.send({ status: "Publisher is running!" });
});

// Publish endpoint
app.post("/publish", async (req, res) => {
  const { message } = req.body;
  channel.publish(EXCHANGE_NAME, "", Buffer.from(message));
  console.log("Published:", message);
  res.send({ status: "Message published!" });
});

const PORT = 4001;
app.listen(PORT, () =>
  console.log(`🚀 Publisher running on http://localhost:${PORT}`)
);
