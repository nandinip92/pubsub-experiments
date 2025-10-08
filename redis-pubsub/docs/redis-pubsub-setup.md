# Redis Pub/Sub Journal — Setup Guide

## 📘 Overview

This guide walks you through setting up a **Redis Pub/Sub** project from scratch.  
You will create folders for **publisher**, **subscriber**, and **frontend**, configure **Docker Compose** for Redis, and implement a simple **real-time messaging system** connecting **Node.js**, **Python**, and **React**.

You will learn how to:

- Set up Redis with Docker
- Connect Node.js (publisher) to Redis
- Subscribe using Python
- Build a simple React frontend
- Test real-time message passing

---

## 📂 Table of Contents

- [Step 1: Create the Main Folder Structure](#-step-1-create-the-main-folder-structure)
- [Step 2: Add Docker Compose for Redis](#-step-2-add-docker-compose-for-redis)
- [Step 3: Create the Publisher (Node.js)](#-step-3-create-the-publisher-nodejs)
- [Step 4: Create the Subscriber (Python)](#-step-4-create-the-subscriber-python)
- [Step 5: Create the Frontend (Vite + React)](#-step-5-create-the-frontend-vite--react)

---

## 🧩 Step 1: Create the Main Folder Structure

Open your terminal:

```bash
mkdir redis-pubsub
cd redis-pubsub

```

Inside, create these subfolders:

mkdir publisher-js subscriber-python frontend-vite

You now have the following structure:

```bash
redis-pubsub/
├── README.md                   # Redis-specific README
├── docs/
│   └── redis-pubsub.md         # Notes and overview of Redis Pub/Sub
├── publisher-js/
│   ├── package.json            # Node.js package file
│   └── publisher.js            # Node.js publisher code
├── subscriber-python/
│   ├── requirements.txt        # Python dependencies
│   └── subscriber.py           # Python subscriber code
└── docker-compose.yml          # Docker Compose for Redis

```

## 🐳 Step 2: Add Docker Compose for Redis

Inside redis-pubsub-journal/, create a file named docker-compose.yml with the following content:

```yaml
version: "3.8"

services:
  redis:
    image: redis:7
    container_name: redis-pubsub
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### ✅ Explanation

- Sets up a Redis container named redis-pubsub

- Exposes Redis on port `6379`

- Uses a named volume redis_data to persist data

Now start it up:

```bash
docker compose up -d
```

Check it’s running:

```bash
docker ps
```

You should see a container named redis-pubsub.

## 🟢 Step 3: Create the Publisher (Node.js)

Navigate to the publisher folder:

```bash
cd publisher-js
npm init -y
npm install express redis cors
```

Set `"type": "module"` in `package.json` so we can use ES Modules.

### Create a file named `index.js` inside `publisher-js`.

```javascript
// Import required libraries
import express from "express"; // Express is a web framework for building HTTP servers
import { createClient } from "redis"; // Redis client for Node.js
import cors from "cors"; // CORS middleware to allow cross-origin requests

// Create an Express app
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS so frontend apps can call this API
app.use(express.json()); // Parse incoming JSON request bodies automatically

// Connect to Redis
const redisClient = createClient({
  url: "redis://localhost:6379", // Redis server running locally on default port
});

// Handle Redis connection errors
redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis server (this is an async operation)
await redisClient.connect();

// Publish endpoint
app.post("/publish", async (req, res) => {
  // Extract 'message' from request body
  const { message } = req.body;

  // Publish message to Redis channel named 'chat-channel'
  await redisClient.publish("news-channel", message);

  // Log to console for debugging
  console.log(`Published: ${message}`);

  // Send response back to client
  res.send({ status: "Message published!" });
});

// Start the Express server on port 4000
const PORT = 4000;
app.listen(PORT, () => console.log(`Publisher running on port ${PORT}`));
```

### Explanation

- **Express app setup** – Sets up an HTTP server to handle requests. Uses `express.json()` to parse JSON request bodies and `cors()` to allow frontend apps to make requests from a different origin.

- **Redis connection** – Uses `createClient` to connect to a Redis server running locally (`localhost:6379`). Handles errors if the connection fails. Asynchronous operations like connecting and publishing use `async/await`.

- **Publish endpoint (`/publish`)** – Receives messages via POST requests, publishes them to the Redis channel `news-channel`, and responds with a confirmation. Subscribers listening to this channel will receive messages in real-time.

- **Server start** – The Express server listens on port 4000 for incoming HTTP requests.

Start the publisher:

```bash
node index.js
```

## 🐍 Step 4: Create the Subscriber (Python)

Navigate to subscriber folder:

```bash
cd ../subscriber-python

python -m venv venv        # optional but recommended
# Linux / Mac
source venv/bin/activate
# Windows PowerShell
# venv\Scripts\Activate.ps1
```

Install Redis client:

```bash
pip install redis
```

After installing the packages, generate a `requirements.txt` file so others (or yourself on another machine) can recreate the same environment:

```bash
pip freeze > requirements.txt
```

### Create `subscriber.py`:

```python
import redis  # Import the Redis Python client

# Connect to Redis server running locally on default port (6379)
r = redis.Redis(host='localhost', port=6379, db=0)

# Create a PubSub object to subscribe to channels
pubsub = r.pubsub()

# Subscribe to the channel named 'news-channel'
pubsub.subscribe('news-channel')

print("Subscribed to news-channel. Waiting for messages...")

# Listen for new messages on the subscribed channel
for message in pubsub.listen():
    # Filter out subscription confirmation messages
    if message['type'] == 'message':
        # Decode the message bytes to string and print
        print(f"[PY SUBSCRIBER] Received: {message['data'].decode()}")
```

#### Explanation

1. **Redis connection** – Connects to a Redis server running on `localhost` with database `0`.

2. **PubSub object** – The `pubsub()` method creates a subscriber instance to listen to one or more channels.

3. **Subscription** – `subscribe('news-channel')` registers this subscriber to receive messages sent to `news-channel`.

4. **Listening for messages** – `pubsub.listen()` is an infinite loop that waits for messages. Each message has a `type` field; only messages of type `'message'` are actual published messages (others are subscription events).

5. **Decoding message** – Redis stores messages as bytes, so `decode()` converts them to a readable string.

6. **Output** – Prints every message received in real-time with a `[PY SUBSCRIBER]` prefix for clarity.

## 💻 Step 5: Create the Frontend (Vite + React)

Navigate to frontend folder

```bash
cd ../frontend-vite
npm create vite@latest . -- --template react
npm install
npm install axios
```

Update `App.jsx`

```javascript
import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message) return;

    try {
      await fetch("http://localhost:4000/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Redis Pub/Sub Demo</h2>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter news message"
        style={{ padding: "0.5rem", width: "300px" }}
      />
      <button
        onClick={sendMessage}
        style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
      >
        Send
      </button>
    </div>
  );
}

export default App;
```
