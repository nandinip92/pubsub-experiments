# 🐇 RabbitMQ Pub/Sub — Real-time News Broadcaster

A simple, beginner-friendly project demonstrating Publish–Subscribe (Pub/Sub) messaging using RabbitMQ, with:

- A Node.js Publisher (Express + amqplib)

- A Python Subscriber

- A Vite + React Frontend

This setup is the second entry in my Pub-Sub Journal, following the Redis version — designed to understand how RabbitMQ differs in architecture, message handling, and exchange mechanisms.

---

## 📑 Table of Contents

- [🐇 RabbitMQ Pub/Sub — Real-time News Broadcaster](#-rabbitmq-pubsub--real-time-news-broadcaster)
  - [🚀 Project Overview](#-project-overview)
    - [🧩 Architecture](#-architecture)
      - [Simple Flow](#simple-flow)
      - [Detailed Flow](#detailed-flow)
    - [🔁 Message Flow Sequence (RabbitMQ Pub/Sub)](#-message-flow-sequence-rabbitmq-pubsub)
  - [⚙️ Tech Stack](#️-tech-stack)
  - [🧱 Folder Structure](#-folder-structure)
  - [🐳 Setup Instructions](#-setup-instructions)
    - [1️⃣ Start RabbitMQ (Docker)](#1️⃣-start-rabbitmq-docker)
    - [2️⃣ Run the Publisher (Node.js)](#2️⃣-run-the-publisher-nodejs)
    - [3️⃣ Run the Subscriber (Python)](#3️⃣-run-the-subscriber-python)
    - [4️⃣ Run the Frontend (Vite + React)](#4️⃣-run-the-frontend-vite--react)
  - [✅ Expected Output](#-expected-output)
  - [🧠 Key Concept: Exchanges in RabbitMQ](#-key-concept-exchanges-in-rabbitmq)
  - [🪶 Next Steps](#-next-steps)

---

## 🚀 Project Overview

### 🧩 Architecture

#### Simple Flow

```sql
+----------------+       +----------------+          +----------------------+
| React Frontend | --->→ | Node.js Publisher | --->→ | RabbitMQ (Broker)    |
+----------------+       +----------------+          +----------------------+
                                                  ↓
                                        +----------------------+
                                        | Python Subscriber    |
                                        +----------------------+

```

#### Detailed Flow

```pgsql
            ┌────────────────┐
            │ React (Vite)   │
            │ User sends     │
            │ message via UI │
            └───────┬────────┘
                    │ HTTP POST /publish
                    ▼
   ┌──────────────────────────────────────┐
   │ Node.js Publisher                    │
   │ Publishes message                    │
   │ to exchange "news-exchange" (fanout) │
   └────────────────┬─────────────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │  RabbitMQ Server        │
        │  (Message Broker)       │
        │  Routes to all queues   │
        │  bound to the exchange  │
        └───────┬─────────────────┘
                    │
                    ▼
            ┌────────────────────┐
            │ Python Subscriber  │
            │ Listens to queue   │
            │ bound to exchange  │
            └────────────────────┘

```

- **Frontend (Vite + React)** – Sends messages from browser

- **Publisher (Node.js)** – Publishes messages to a fanout exchange

- **RabbitMQ** – Routes messages to all subscribers bound to that exchange

- **Subscriber (Python)** – Consumes messages from its queue

### 🔁 Message Flow Sequence (RabbitMQ Pub/Sub)

```bash
User
 │
 │ 1. Sends message via frontend form
 ▼
React Frontend
 │
 │ 2. Makes POST request → /publish
 ▼
Node.js Publisher
 │
 │ 3. Publishes message → RabbitMQ fanout exchange "news-exchange"
 ▼
RabbitMQ (Broker)
 │
 │ 4. Routes and delivers messages to all bound queues
 ▼
Python Subscriber(s)
 │
 └─► 5. Receives and processes message

```

---

## ⚙️ Tech Stack

| Component      | Technology                      |
| -------------- | ------------------------------- |
| Message Broker | RabbitMQ                        |
| Publisher      | Node.js (Express, amqplib)      |
| Subscriber     | Python (pika)                   |
| Frontend       | React (Vite)                    |
| Environment    | Docker (for RabbitMQ container) |

---

## 🧱 Folder Structure

```pgsql

rabbitmq-pubsub/
├── README.md
├── docker-compose.yml              # RabbitMQ setup
├── publisher-js/                   # Node.js publisher service
│   ├── package.json
│   └── server.js
├── subscriber-python/              # Python subscriber (console-based)
│   ├── requirements.txt
│   └── subscriber.py
├── docs/                           # Documentation for setup & learning notes
│   └── rabbitmq-setup.md
│   └── rabbitmq-publisher.md
│   └── rabbitmq-subscriber.md
└── ../frontend/                    # Shared Vite + React frontend
    ├── package.json
│   ├── .env.rabbitmq               # Environment config for RabbitMQ Pub/Sub
    ├── index.html
    └── src/
        ├── main.jsx
        └── App.jsx

```

## 🐳 Setup Instructions

### 1️⃣ Start RabbitMQ (Docker)

```bash
docker compose up -d
```

### 2️⃣ Run the Publisher (Node.js)

```bash
cd publisher-js
npm install
node publisher.js
```

Runs on [http://localhost:4001](http://localhost:4001)

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

### 4️⃣ Run the Frontend (Vite + React)

```bash
cd ../frontend
npm install
npm run dev -- --mode rabbitmq

# [OR] npm run:rabbitmq
```

Open [http://localhost:5173](http://localhost:5173) in your browser → type a message and hit “Send”

🎉 You’ll see the message printed in your subscriber’s terminal!

## ✅ Expected Output

1. Send a message from the React app.

2. Node.js publisher logs:

```bash
Published: "Breaking News — RabbitMQ Rocks!"
```

3. Python subscriber prints:

```bash
[PY SUBSCRIBER] Received: Breaking News — RabbitMQ Rocks!
```

---

## 🧠 Key Concept: Exchanges in RabbitMQ

Unlike Redis, RabbitMQ uses exchanges to route messages:

| Type        | Description                                    |
| ----------- | ---------------------------------------------- |
| **fanout**  | Sends messages to all bound queues (used here) |
| **direct**  | Routes by exact routing key                    |
| **topic**   | Routes by pattern (e.g., `news.sports`)        |
| **headers** | Routes based on message headers                |

n this project, we use **fanout** to mimic Redis-style broadcast behavior.

---

## 🪶 Next Steps

- Add multiple subscribers to see message fan-out

- Try a topic exchange for categorized news

- Compare message durability and queue persistence with Redis
