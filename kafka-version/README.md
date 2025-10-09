# Kafka Pub/Sub — Real-time News Broadcaster

A beginner-friendly project demonstrating **Publish–Subscribe (Pub/Sub)** messaging using **Kafka**, with:

- **Node.js Producer**
- **Python Consumer**
- **Vite + React Frontend** (shared with Redis/RabbitMQ)

This setup forms the Kafka part of my **Pub/Sub Journal**, allowing comparison with Redis and RabbitMQ.

## Table of Contents

- [Kafka Pub/Sub — Real-time News Broadcaster](#kafka-pubsub-—-real-time-news-broadcaster)
- [🚀 Project Overview](#🚀-project-overview)
  - [🧩 Architecture](#🧩-architecture)
  - [🔁 Message Flow Sequence (Kafka Pub/Sub)](#🔁-message-flow-sequence-kafka-pubsub)
- [⚙️ Tech Stack](#⚙️-tech-stack)
- [🧱 Folder Structure](#🧱-folder-structure)
- [🐳 Setup Instructions](#🐳-setup-instructions)
  - [1️⃣ Start Kafka and Zookeeper (Docker)](#1️⃣-start-kafka-and-zookeeper-docker)
  - [2️⃣ Run the Publisher (Node.js)](#2️⃣-run-the-publisher-nodejs)
  - [3️⃣ Run the Subscriber (Python)](#3️⃣-run-the-subscriber-python)
  - [4️⃣ Run the Frontend (Vite + React)](#4️⃣-run-the-frontend-vite--react)
- [✅ Expected Output](#✅-expected-output)
- [🧠 Key Concept: Kafka Topics](#🧠-key-concept-kafka-topics)
- [✅ Key Points](#✅-key-points)
- [🧩 Summary](#🧩-summary)

---

## 🚀 Project Overview

### 🧩 Architecture

```text
          ┌─────────────┐
          │  Producer   │ (Node.js Express API)
          └─────┬───────┘
                │  PUBLISH "news-topic"
                ▼
        ┌───────────────────┐
        │    Kafka Broker   |
        |  (via zookeeper)  │
        │  Topic: news-topic│
        └───────┬───────────┘
                │
                ▼
         ┌─────────────┐
         │  Consumer   │ (Python)
         └─────────────┘
```

---

### 🔁 Message Flow Sequence (Kafka Pub/Sub)

```text
User
 │
 │ 1. Sends message via frontend form
 ▼
React Frontend
 │
 │ 2. Makes POST request → /publish
 ▼
Node.js Producer
 │
 │ 3. Sends message → Kafka topic "news-topic"
 ▼
Kafka Broker
 │
 │ 4. Stores message durably in topic
 ▼
Python Consumer
 │
 └─► 5. Receives message and processes (prints/logs it)
```

---

## ⚙️ Tech Stack

| Component      | Technology                 |
| -------------- | -------------------------- |
| Message Broker | Kafka                      |
| Producer       | Node.js (Express, kafkajs) |
| Consumer       | Python (kafka-python)      |
| Frontend       | React (Vite)               |
| Environment    | Docker (Kafka + Zookeeper) |

---

## 🧱 Folder Structure

```text
kafka-version/
├── README.md
├── docker-compose.yml          # Kafka + Zookeeper
├── producer-js/                # Node.js producer
│   ├── package.json
│   └── producer.js
├── consumer-python/            # Python consumer
│   ├── requirements.txt
│   └── consumer.py
├── docs/                           # Documentation for setup & learning notes
│   └── kafka-setup.md
│   └── kafka-producer.md
│   └── kafka-consumer.md
└── ../frontend/                    # Shared Vite + React frontend
    ├── package.json
│   ├── .env.kafka                # Environment config for Kafka Pub/Sub
    ├── index.html
    └── src/
        ├── main.jsx
        └── App.jsx
```

---

## 🐳 Setup Instructions

### 1️⃣ Start Kafka and Zookeeper (Docker)

```bash
docker compose up -d
```

> 💡 **Why Zookeeper?**
>
> - Kafka uses Zookeeper to manage broker metadata, leader elections, and topic configurations.
> - Zookeeper keeps track of Kafka nodes and coordinates them.
> - Newer Kafka versions (v3.3+) support **KRaft mode**, removing the need for Zookeeper — but in this project, we use the classic setup for learning purposes.

---

### 2️⃣ Run the Publisher (Node.js)

```bash
cd publisher-js
npm install
node publisher.js
```

Runs on [http://localhost:4002](http://localhost:4002)

---

### 3️⃣ Run the Subscriber (Python)

```bash
cd subscriber-python
python -m venv venv
# Activate venv:
#   Linux/Mac: source venv/bin/activate
#   Windows: venv\Scripts\Activate.ps1

pip install -r requirements.txt
python subscriber.py
```

---

### 4️⃣ Run the Frontend (Vite + React)

```bash
cd ../frontend
npm install
npm run dev -- --mode kafka

# [OR] npm run:kafka
```

Open [http://localhost:5173](http://localhost:5173) → type a message and hit “Send”

🎉 You’ll see the message appear in your subscriber terminal!

---

## ✅ Expected Output

1. Send a message from the React app.

2. Node.js publisher logs:

```bash
Published: "Breaking News — Kafka Rules!"
```

3. Python subscriber prints:

```bash
[PY SUBSCRIBER] Received: Breaking News — Kafka Rules!
```

## 🧠 Key Concept: Kafka Topics

Kafka organizes messages into **topics**, which act like logical channels.

| Concept            | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| **Topic**          | Logical channel for messages (like a queue or feed).               |
| **Producer**       | Publishes messages to a topic.                                     |
| **Consumer**       | Reads messages from a topic.                                       |
| **Consumer Group** | Set of consumers sharing the same group ID, dividing message load. |
| **Offset**         | Position of a consumer in a topic — allows replaying messages.     |

Kafka differs from traditional Pub/Sub systems because:

- Messages are stored on disk and can be **replayed**.
- Consumers can **read independently** (not destructive reads).
- Ideal for **stream processing** and **analytics pipelines**.

## ✅ Key Points

- Kafka **persists messages** by default; they are not lost if consumer is offline.
- Producers send messages to a **topic**, consumers subscribe to that topic.
- Consumer groups allow **scaling and load balancing** between multiple consumers.
- Ideal for **high-throughput, persistent, distributed messaging** systems.

## 🧩 Summary

| Component   | Tech                  | Description                          |
| ----------- | --------------------- | ------------------------------------ |
| Publisher   | Node.js + Express     | Produces messages to Kafka           |
| Subscriber  | Python + Kafka client | Consumes messages from topic         |
| Broker      | Kafka (via Docker)    | Manages topics and message retention |
| Coordinator | Zookeeper             | Keeps Kafka cluster metadata         |
| Frontend    | React + Vite          | Sends and displays messages          |

---

Kafka provides **durable, scalable message streaming**. Unlike RabbitMQ or Redis, it’s built for **high throughput, event-driven architectures**, and **data replay** across distributed systems.
