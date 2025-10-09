# 🥨 Kafka Setup — Pub/Sub Example

## 📑 Table of Contents

- [Overview](#overview)
- [Step 1 — Docker Compose for Kafka & Zookeeper](#step-1---docker-compose-for-kafka--zookeeper)
- [Step 2 — Node.js Producer](#step-2---nodejs-producer)
- [Step 3 — Python Consumer](#step-3---python-consumer)
- [Step 4 — Frontend Integration](#step-4---frontend-integration)
- [Key Points](#key-points)

---

## 📘 Overview

This project demonstrates a **Kafka Pub/Sub setup**:

- **Producer**: Node.js Express API publishing messages to a topic.
- **Consumer**: Python script consuming messages from the topic.
- **Purpose**: Learn persistent, distributed messaging and compare with Redis/RabbitMQ.

---

## Step 1 — Docker Compose for Kafka & Zookeeper

Kafka requires **Zookeeper** to manage cluster metadata (broker info, topics, partitions). In production Kafka 2.x+ has KRaft mode, but for beginners, we use Zookeeper for simplicity.

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.1
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181 # Port for Kafka brokers to connect
      ZOOKEEPER_TICK_TIME: 2000 # Heartbeat interval for Zookeeper
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.6.1
    depends_on:
      - zookeeper
    ports:
      - "9092:9092" # Client port for producer/consumer
    environment:
      KAFKA_BROKER_ID: 1 # Unique broker ID
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181 # Connect to Zookeeper for metadata
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092 # For clients outside docker
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1 # Minimal replication for beginner setup
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"   # Enable auto topic creation
```

### 🔍 Explanation

- **Zookeeper**:

  - Maintains metadata about Kafka topics, partitions, and brokers.
  - Tracks which brokers are alive.
  - Coordinates leader elections for partitions.

- **Kafka Broker**:

  - Uses Zookeeper to register itself and manage topics.
  - Exposes `9092` for producers and consumers.

- **Why required in this setup**: Even though we have a single broker, Zookeeper ensures the broker knows about topics, partitions, and maintains offsets correctly.

Start services:

```bash
docker compose up -d
```

Verify Kafka is running:

```bash
docker exec -it kafka-version_kafka_1 kafka-topics --bootstrap-server localhost:9092 --list
```

---

## Step 2 — Node.js Producer

```bash
cd producer-js
npm init -y
npm install kafkajs express cors
```

Create `producer.js`:

```javascript
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
await producer.connect();
const TOPIC = "news-topic";

// POST endpoint to publish messages to Kafka
app.post("/publish", async (req, res) => {
  const { message } = req.body;
  await producer.send({ topic: TOPIC, messages: [{ value: message }] });
  console.log("Published:", message);
  res.send({ status: "Message published!" });
});

// Start the server
app.listen(4002, () =>
  console.log("🚀 Kafka producer running at http://localhost:4002")
);
```

#### 👉For further explaination on code check [kafka-producer.md](./kafka-producer.md)

---

## Step 3 — Python Consumer

```bash
cd consumer-python
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\Activate.ps1
# Linux/Mac: source venv/bin/activate

pip install kafka-python
pip freeze > requirements.txt
```

Create `consumer.py`:

```python
from kafka import KafkaConsumer

# Kafka topic to subscribe to
TOPIC = "news-topic"

# Create Kafka consumer
consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers=['localhost:9092'],   # Kafka broker
    auto_offset_reset='earliest',           # Start from earliest message if no offset exists
    group_id='news-group',                   # Consumer group ID
    enable_auto_commit=True                  # Automatically commit offsets
)

print("⏳ Waiting for messages...")

# Listen for messages indefinitely
for message in consumer:
    print(f"📥 [Consumer] Received: {message.value.decode()}")

```

#### 👉For further explaination on code check [kafka-consumer.md](./kafka-consumer.md)

---

## Step 4 — Frontend Integration

- Reuse the **React Vite frontend** from Redis/RabbitMQ.
- Update API endpoint for Kafka producer:

```javascript
await fetch('http://localhost:4002/publish', { ... });
```

- Input box and send button remain the same.

---

## Key Points

- Kafka **requires Zookeeper** to manage metadata (in this setup).
- Kafka **stores messages durably**; messages aren’t lost if consumers are offline.
- Producers send messages to a **topic**, and consumers subscribe to the topic.
- **Consumer groups** allow scaling and load balancing.
- Ideal for \*\*high-throughput, persistent messaging syste
