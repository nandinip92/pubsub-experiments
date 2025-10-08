import express from "express";
import { createClient } from "redis";
import cors from "cors";

const app = express();
app.use(cors());           // Allow frontend apps to make requests
app.use(express.json());   // Parse JSON request bodies

// Connect to Redis
const redisClient = createClient({ url: "redis://localhost:6379" });
redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect();

// Health check route
app.get("/", (req, res) => {
  res.send({ status: "Publisher is running!" });
});

// Endpoint to publish messages to Redis
app.post("/publish", async (req, res) => {
  const { message } = req.body;
  await redisClient.publish("news-channel", message); // Send message to channel
  console.log(`Published: ${message}`);
  res.send({ status: "Message published!" });
});



// Start the Express server on port 4000
const PORT = 4000;
app.listen(PORT, () => console.log(`Publisher running on port ${PORT}`));
