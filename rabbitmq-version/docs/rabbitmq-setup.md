# 🐇 RabbitMQ Setup — Pub/Sub Example

## 📑 Table of Contents

- [Overview](#📘-overview)
- [Architecture](#🏗-architecture)
- [Step 1 — Docker Compose for RabbitMQ](#step-1-—-docker-compose-for-rabbitmq)
- [Step 2 — Node.js Publisher](#step-2-—-nodejs-publisher)
  - [publisher.js](#publisherjs)
  - [Flow Explanation](#flow-explanation)
- [Step 3 — Python Subscriber](#step-3-—-python-subscriber)
  - [subscriber.py](#subscriberpy)
  - [Flow Explanation](#flow-explanation-1)
- [Key Points](#💡-key-points)

---

## 📘 Overview

This project demonstrates a **RabbitMQ Pub/Sub setup** with:

- **Publisher**: Node.js Express API publishing messages to a fanout exchange.
- **Subscriber**: Python script consuming messages from a temporary queue.
- **Exchange Type**: Fanout — broadcasts messages to all bound queues.
- **Purpose**: Learn real-time messaging and loosely coupled communication.

---

## 🏗 Architecture

```text
          ┌─────────────┐
          │  Publisher  │ (Node.js Express API)
          └─────┬───────┘
                │  PUBLISH "news-exchange"
                ▼
        ┌──────────────────┐
        │ RabbitMQ Exchange│  (fanout)
        │ "news-exchange"  │
        └───┬─────────┬────┘
            │         │
            ▼         ▼
   ┌─────────────┐ ┌─────────────┐
   │ Subscriber1 │ │ Subscriber2 │
   │ (Python)    │ │ (Python)    │
   │ temp queue  │ │ temp queue  │
   └─────────────┘ └─────────────┘
```

## Step 1 — Docker Compose for RabbitMQ

```yaml
version: "3.8"

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672" # AMQP port for publisher/subscriber
      - "15672:15672" # Web management UI
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

Explanation:

`5672` → RabbitMQ client port

`15672` → Management UI (`http://localhost:15672`)

Default credentials: `guest/guest`

Start RabbitMQ:

```bash
docker compose up -d
```

Open UI: `http://localhost:15672` → login `guest/guest`

## Step 2 — Node.js Publisher

Navigate to `publisher-js`:

```bash
cd rabbitmq-version/publisher-js
npm init -y
npm install amqplib express cors
```

### Create publisher.js

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

// Connect to RabbitMQ and create a fanout exchange
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

#### Explanation of the flow

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

## Step 3 — Python Subscriber

Navigate to subscriber-python:

```bash
# 1️⃣ Navigate to subscriber folder and create a virtual environment
cd ../subscriber-python
python -m venv venv

# 2️⃣ Activate the virtual environment
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# 3️⃣ Install pika (latest stable version)
pip install pika

# 4️⃣ Freeze installed packages into requirements.txt
pip freeze > requirements.txt

```

### Create subscriber.py:

```python

import pika  # RabbitMQ client library for Python

# RabbitMQ connection URL and exchange name
RABBITMQ_URL = "amqp://guest:guest@localhost:5672"
EXCHANGE_NAME = "news-exchange"

# Create connection parameters from URL
params = pika.URLParameters(RABBITMQ_URL)

# Establish a blocking (synchronous) connection to RabbitMQ
connection = pika.BlockingConnection(params)

# Open a channel (virtual connection) inside RabbitMQ
channel = connection.channel()

# Create a temporary queue (empty string name means RabbitMQ generates a unique name)
# exclusive=True ensures queue is deleted when connection closes
result = channel.queue_declare(queue="", exclusive=True)
queue_name = result.method.queue  # Get the generated queue name

# Declare the fanout exchange (if it doesn't exist already)
channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='fanout')

# Bind the temporary queue to the fanout exchange
# Fanout exchange ignores routing keys, so queue will receive all messages
channel.queue_bind(exchange=EXCHANGE_NAME, queue=queue_name)

print("Waiting for messages. Press CTRL+C to exit.")

# Callback function executed whenever a message is received
def callback(ch, method, properties, body):
    # Decode bytes to string and print message
    print(f"[Subscriber] Received: {body.decode()}")

# Start consuming messages from the queue
# auto_ack=True automatically acknowledges receipt (no manual ack required)
channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

# Start the consuming loop (blocking call)
channel.start_consuming()

```

#### 📝 Explanation

1. **Connect to RabbitMQ**

   - Uses `pika.BlockingConnection` with the AMQP URL.
   - Creates a channel, which is a lightweight virtual connection inside RabbitMQ.

2. **Queue Creation**

   - `queue=""` tells RabbitMQ to generate a **unique temporary queue**.
   - `exclusive=True` ensures ensures:
     - The queue is deleted automatically when the subscriber disconnects.
     - Useful for temporary or short-lived subscribers.

3. **Exchange Declaration**

   - Declares a `fanout` exchange, which **broadcasts messages to all bound queues**.

4. **Binding**

   - Connects the temporary queue to the exchange so the subscriber receives messages.

5. **Callback Function**

   - Executed whenever a message is received.
   - `body.decode()` converts the message from bytes to string.

6. **Consume Messages**

   - `basic_consume` sets the callback for the queue.
   - `auto_ack=True` automatically acknowledges messages, so RabbitMQ knows they are processed.

7. **Start Consuming**
   - `start_consuming()` enters an infinite loop, listening for messages continuously.

#### 💡 Key Points

- This subscriber is **temporary** and only exists while the script is running.
- Works with **fanout exchange**, so every subscriber receives a copy of all messages.
- Ideal for **learning and lightweight pub/sub** scenarios.