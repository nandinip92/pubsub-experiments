# publisher.md

# 🐇🟢 Node.js Publisher

This file contains the Node.js publisher that sends messages to RabbitMQ.

#\ Table of Contents — Node.js Publisher 🟢

- [Overview](#overview)
- [Setup Steps](#setup-steps)
- [Version 1 — Basic Publisher](#version-1-basic-publisher)
  - [Code](#version-1--basic-publisher)
  - [Explanation](#📝-explanation--basic-publisher)
- [Version 2 — Persistent Publisher](#version-2--persistent-publisher)
  - [Code](#version-2--persistent-publisher-1)
  - [Explanation](#📝-explanation--persistent-publisher)
- [Flow](#flow)
- [Benefits](#✅-benefits)
- [Comparison Table](#⚖️-comparison-table)
- [Version Log](#📜-version-log)

## Overview

This file contains the **Node.js Publisher** that sends messages to RabbitMQ using a **fanout exchange**.

Key points:

- **Purpose**: Demonstrates a Pub/Sub pattern with Node.js and RabbitMQ.
- **Publisher**: Node.js Express API that broadcasts messages to all subscribers.
- **Exchange Type**: Fanout — every message is delivered to all bound queues, ignoring routing keys.
- **Versions**:

  - **Version 1**: Basic publisher with a non-durable exchange (messages are lost if RabbitMQ restarts).
  - **Version 2**: Persistent publisher with a durable exchange and persistent messages (ensures reliability and works with durable subscribers).

- **Usage**: The publisher exposes a POST endpoint `/publish` that accepts JSON payloads like:

```json
{ "message": "Hello World" }
```

- **Technology Stack**:

  - Node.js + Express for HTTP API
  - amqplib for RabbitMQ connection
  - CORS enabled for frontend interaction

## Setup Steps

```bash
# Navigate to publisher folder
cd publisher-js

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express amqplib cors


# 4️⃣ (Optional) Create a .env file for credentials
# RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## Version 1 — Basic Publisher

```javascript
// Import required packages
import express from "express"; // For creating HTTP server
import amqp from "amqplib"; // For interacting with RabbitMQ
import cors from "cors"; // For handling cross-origin requests

const app = express();
app.use(cors()); // Enable CORS so frontend apps can call this API
app.use(express.json()); // Parse JSON request bodies

// RabbitMQ connection and exchange details
const RABBITMQ_URL = "amqp://guest:guest@localhost:5672"; // AMQP URL with default credentials
const EXCHANGE_NAME = "news-exchange"; // Name of the fanout exchange
let channel; // Channel object for publishing messages

// Connect to RabbitMQ and declare a non-durable fanout exchange
async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL); // Establish connection to RabbitMQ
  channel = await connection.createChannel(); // Create a channel (virtual connection)
  await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: false }); // Create a fanout exchange
  console.log("Connected to RabbitMQ and exchange created");
}
connectRabbitMQ(); // Immediately connect on server startup

// API endpoint to publish a message to the exchange
app.post("/publish", async (req, res) => {
  const { message } = req.body; // Get message from request body
  channel.publish(EXCHANGE_NAME, "", Buffer.from(message)); // Publish message to the exchange (fanout)
  console.log("Published:", message);
  res.send({ status: "Message published!" }); // Send response back to client
});

// Start Express server
const PORT = 4001;
app.listen(PORT, () => console.log(`Publisher running on port ${PORT}`));
```

### 📝 Explanation — Basic Publisher

1. Express Setup

   - Sets up an HTTP server on **port 4001**.
   - Enables **CORS** and **JSON parsing** to handle cross-origin requests and JSON payloads.

2. RabbitMQ Connection

   - Connects to RabbitMQ at `amqp://guest:guest@localhost:5672`.
   - Creates a **channel**, which is like a virtual connection inside RabbitMQ.
   - Declares a **fanout exchange** (`news-exchange`):
   - **Fanout exchange** means every message is sent to **all bound queues**, ignoring routing keys.

3. Publishing Messages

   - The `/publish` endpoint accepts a JSON body like:

   ```json
   { "message": "Hello World" }
   ```

   - Publishes message to fanout exchange → broadcast to all queues

### In simple words:

- Non-durable fanout exchange.
- Messages are lost if RabbitMQ restarts.
- Ideal for learning/testing temporary message flows.

---

## Version 2 — Persistent Publisher

```javascript
import express from "express";
import amqp from "amqplib";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// RabbitMQ connection details
const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "news-exchange";
let channel;

// Connect to RabbitMQ and create a durable fanout exchange
async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  // Durable exchange survives broker restarts
  await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });
  console.log("✅ Connected to RabbitMQ (durable exchange)");
}
connectRabbitMQ();

// POST /publish — publish persistent messages
app.post("/publish", async (req, res) => {
  const { message } = req.body;

  // Publish with message persistence
  channel.publish(EXCHANGE_NAME, "", Buffer.from(message), {
    persistent: true,
  });

  console.log("📨 Published:", message);
  res.send({ status: "Message published!" });
});

const PORT = 4001;
app.listen(PORT, () => console.log(`🚀 Publisher running on port ${PORT}`));
```

### 📝 Explanation — Persistent Publisher

### Durable Exchange

- `durable:true` ensures the **exchange** survives RabbitMQ restarts.
- Works together with durable queues (like in subscriber v2) for end-to-end reliability.

### Persistent Messages

- `persistent:true` marks messages as **persistent**, meaning they’re stored on disk until delivered.
- Guarantees message safety even if RabbitMQ restarts before dispatching.

### 📝 In simple words:

- Durable Exchange: Survives RabbitMQ restarts.
- Persistent Messages: Stored on disk until delivered.
- Ensures end-to-end reliability with durable subscribers.

### Flow

```text
Publisher (persistent msg)
      ↓
Durable Fanout Exchange
      ↓
Durable Queue(s)
      ↓
Subscriber (manual ack)
```

## ✅ Benefits

- **Durable Exchange:** Survives RabbitMQ restarts.
- **Persistent Messages:** Messages remain safe until acknowledged.
- **End-to-End Reliability:** Ensures delivery even if subscribers or RabbitMQ go down.
- **Production Ready:** Ideal for high-availability or fault-tolerant systems.
- **Fanout Flexibility:** Multiple subscribers can receive identical messages simultaneously.

## ⚖️ Comparison Table

| Feature             | Basic (v1)            | Persistent (v2)                |
| ------------------- | --------------------- | ------------------------------ |
| Exchange Type       | Fanout (non-durable)  | Fanout (durable)               |
| Message Persistence | No                    | Yes (`persistent:true`)        |
| Reliability         | Lost on restart       | Survives restarts              |
| Ideal For           | Testing / Learning    | Production-grade reliability   |
| Subscriber Support  | Temporary queues only | Works with durable queues (v2) |

## 📜 Version Log

| Version  | Date       | Description                                                                                    |
| -------- | ---------- | ---------------------------------------------------------------------------------------------- |
| **v1.0** | 2025-10-09 | Initial publisher — temporary fanout exchange (non-durable).                                   |
| **v2.0** | 2025-10-09 | Added durable exchange and persistent messages for reliable publishing to durable subscribers. |
| **v2.1** | TBD        | Future updates — add message validation, error handling, and connection retries.               |
