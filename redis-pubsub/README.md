# Redis Pub/Sub — Real-time News Broadcaster

A simple, beginner-friendly project demonstrating **Publish–Subscribe (Pub/Sub)** messaging using **Redis**, with:

- A **Node.js Publisher**
- A **Python Subscriber**
- A **Vite + React Frontend**

This setup forms the first part of my **Pub-Sub Journal**, where I explore Redis, RabbitMQ, and Kafka to understand their similarities and differences.

---

## 🚀 Project Overview

### 🧩 Architecture

#### Simple Flow

```sql
+----------------+        +----------------+        +-------------------+
| React Frontend | --->→ | Node.js Publisher | --->→ |   Redis (Broker)   |
+----------------+        +----------------+        +-------------------+
                                                   ↓
                                         +--------------------+
                                         | Python Subscriber  |
                                         +--------------------+
```

#### Detailed Flow

```pgsql
   ┌────────────────┐
   │ React (Vite)   │
   │  User sends    │
   │  message via UI│
   └───────┬────────┘
           │ HTTP POST /publish
           │
           ▼
   ┌────────────────────┐
   │ Node.js Publisher  │
   │ Publishes message  │
   │ to Redis channel   │
   └───────┬────────────┘
           │
           ▼
   ┌────────────────────┐
   │   Redis Server     │
   │ (Message Broker)   │
   │  Holds channel     │
   └───────┬────────────┘
           │
           ▼
   ┌────────────────────┐
   │ Python Subscriber  │
   │ Listens to channel │
   │ and prints message │
   └────────────────────┘
```

- **Frontend (Vite + React)** – lets you send messages from the browser
- **Publisher (Node.js)** – publishes messages to Redis channels
- **Redis** – acts as the message broker
- **Subscriber (Python)** – listens to a Redis channel and receives published messages

### 🔁 Message Flow Sequence (Redis Pub/Sub)

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
 │ 3. Publishes message → Redis channel "news-channel"
 ▼
Redis Server (Broker)
 │
 │ 4. Holds & distributes published messages
 ▼
Python Subscriber
 │
 └─► 5. Receives message and processes (prints/logs it)
```

---

## ⚙️ Tech Stack

| Component      | Technology                      |
| -------------- | ------------------------------- |
| Message Broker | Redis                           |
| Publisher      | Node.js (Express, Redis client) |
| Subscriber     | Python (redis-py)               |
| Frontend       | React (Vite)                    |
| Environment    | Docker (for Redis container)    |

---

## 🧱 Folder Structure

```pgsql

redis-pubsub/
├── README.md
├── docker-compose.yml           # Redis
├── publisher-js/                # HTTP API to publish messages
│   ├── package.json
│   └── server.js
├── subscriber-python/           # Console subscriber (learning)
│   ├── requirements.txt
│   └── subscriber.py
└── frontend/                    # Vite + React app
    ├── package.json
│   ├── .env.redis               # Environment config for Redis Pub/Sub
    ├── index.html
    └── src/
        ├── main.jsx
        └── App.jsx
```

---

## 🐳 Setup Instructions

### 1️⃣ Start Redis (Docker)

```bash
docker compose up -d
```

### 2️⃣ Run the Publisher (Node.js)

```bash
cd publisher-js
npm install
node index.js
```

Runs on [http://localhost:4000](http://localhost:4000)

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
npm run dev -- --mode redis

# [OR] npm run:redis
```

Open [http://localhost:5173](http://localhost:5173) in your browser → type a message and hit “Send”

🎉 You’ll see the message printed in your subscriber’s terminal!

## ✅ Expected Output

1. Send a message from the React app.

2. The Node.js publisher logs:

```makefile
Published: Hello Redis!
```

The Python subscriber prints:

```csharp
[PY SUBSCRIBER] Received: Hello Redis!
```
