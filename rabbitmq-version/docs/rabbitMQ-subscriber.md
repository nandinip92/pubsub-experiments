# 🐇🐍 Python Subscriber

This file contains the Python subscriber that consumes messages from RabbitMQ.

# Table of Contents — 🐍 Python Subscriber

- [Overview](#overview)
- [Setup Steps](#setup-steps)
- [Version 1 — Temporary Subscriber](#version-1--temporary-subscriber)
  - [Code](#subscriberpy)
  - [Explanation](#-explanation)
  - [Key Points](#-key-points)
- [Version 2 — Persistent Subscriber (v2)](#version-2--persistent-subscriber-v2)
  - [Code](#subscriberpy-1)
  - [Explanation — Persistent Subscriber](#-explanation--persistent-subscriber)
  - [Durable Exchange and Queue](#durable-exchange-and-queue)
  - [Named Queue](#named-queue)
  - [Manual Acknowledgment](#manual-acknowledgment)
  - [Reliable Message Flow](#reliable-message-flow)
  - [Use Case](#use-case)
  - [Why This Matters](#why-this-matters)
  - [Comparison Table](#⚖️-comparision-table)
- [Version Log](#-version-log)

---

## Overview

This file contains the **Python Subscriber** that listens for messages from RabbitMQ using a **fanout exchange**.

### Key Highlights:

- **Purpose**: Demonstrates a Pub/Sub (Publish–Subscribe) model using RabbitMQ.
- **Subscriber Role**: Listens to the `news-exchange` and processes incoming messages.
- **Exchange Type**: **Fanout** — every message published to this exchange is broadcast to **all bound queues**.
- **Versions**:
  - **Version 1** — Uses a **temporary queue** (deleted when the subscriber disconnects).
  - **Version 2** — Uses a **durable queue** and **manual acknowledgments** for message reliability.
- **Use Case**:  
  Ideal for backend services or microservices that need **real-time message delivery** or **event-driven communication**.

### Technologies Used:

- **Language**: Python 🐍
- **Library**: `pika` (for RabbitMQ client connection)
- **Broker**: RabbitMQ 🐇

---

## Setup Steps

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

### Version 1 — Temporary Subscriber

#### `subscriber.py`:

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

### 📝 Explanation

1. **Connect to RabbitMQ**

   - Uses `pika.BlockingConnection` with the AMQP URL.
   - Creates a channel, which is a lightweight virtual connection inside RabbitMQ.

2. **Queue Creation**

   - `queue=""` tells RabbitMQ to generate a **unique temporary queue**.
   - `exclusive=True` ensures ensures:
     - The queue is deleted automatically when the subscriber disconnects.
     - Useful for temporary or short-lived subscribers.

3. **Exchange Declaration**

   - Declares a fanout exchange (`news-exchange`).
   - Fanout exchanges **broadcast** messages to all bound queues.

4. **Binding**

   - Connects the temporary queue to the exchange so the subscriber receives messages.

5. **Message Handling**

   - Each incoming message triggers the `callback` function.
   - `body.decode()` converts the message from bytes to string.

6. **Consume Messages/Acknowledgment**

   - `basic_consume` sets the callback for the queue.
   - `auto_ack=True` → Messages are automatically acknowledged once delivered.
   - Means: if the subscriber crashes, messages are not redelivered

7. **Start Consuming/ Consumption Loop**
   - `start_consuming()` enters an infinite loop, listening for messages continuously.

#### 💡 Key Points

- Queue is temporary and exists only during runtime.

- Messages are lost if subscriber disconnects.

- Ideal for learning or short-lived scenarios.

- Great for testing basic Pub/Sub flow before moving to durable queues.

## Version 2 — Persistent Subscriber (v2)

In the next version, we make the queue **durable** and use **manual acknowledgments** to ensure reliability.
This setup guarantees that messages won’t be lost if the subscriber or RabbitMQ restarts

### `subscriber.py`

```python
import pika  # RabbitMQ client library for Python

# RabbitMQ connection URL and exchange name
RABBITMQ_URL = "amqp://guest:guest@localhost:5672"
EXCHANGE_NAME = "news-exchange"
QUEUE_NAME = "news-queue"  # Named durable queue

# Create connection parameters
params = pika.URLParameters(RABBITMQ_URL)
connection = pika.BlockingConnection(params)
channel = connection.channel()

# Declare a durable fanout exchange
channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='fanout', durable=True)

# Declare a named durable queue (persists even after subscriber disconnects)
channel.queue_declare(queue=QUEUE_NAME, durable=True)

# Bind the durable queue to the fanout exchange
channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME)

print("Waiting for messages. Press CTRL+C to exit.")

# Callback function for message processing
def callback(ch, method, properties, body):
    print(f"[Subscriber] Received: {body.decode()}")
    # Acknowledge after successful processing
    ch.basic_ack(delivery_tag=method.delivery_tag)

# Consume messages with manual acknowledgment
channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback, auto_ack=False)

# Start the consuming loop
channel.start_consuming()

```

### 📝 Explanation — Persistent Subscriber

#### Durable Exchange and Queue

- `durable=True` makes both the exchange and queue survive RabbitMQ restarts.
- Ensures queued messages aren’t lost if the subscriber or RabbitMQ restarts.

#### Named Queue

- `queue="news-queue"` makes the queue **persistent and reusable**.
- Unlike the temporary queue, it won’t auto-delete on disconnect.
- Multiple durable queues can bind to the same fanout exchange to receive copies of all messages.

#### Manual Acknowledgment

- `auto_ack=False` means messages stay in the queue until explicitly acknowledged.
- `ch.basic_ack(delivery_tag=method.delivery_tag)` confirms successful processing.
- If the subscriber crashes mid-processing, RabbitMQ **re-delivers** the message.

#### Reliable Message Flow

```text
Publisher → Fanout Exchange → Durable Queue → Subscriber (Manual Ack)
```

#### Use Case

- Ideal for production-grade systems needing message persistence and fault tolerance.

### Why This Matters

- Durable Queue: Survives RabbitMQ restarts.

- Manual Acks: Ensures no message is lost if processing fails midway.

- Named Queue: Multiple consumers can share or compete for messages (useful in scaling scenarios)

### ⚖️ Comparision Table

| Feature        | Temporary (v1)          | Persistent (v2)               |
| -------------- | ----------------------- | ----------------------------- |
| Queue Type     | Temporary (auto-delete) | Named Durable                 |
| Acknowledgment | Auto (no retry)         | Manual (retries if not acked) |
| Durability     | Lost on restart         | Survives restarts             |
| Ideal For      | Testing / Learning      | Production-like reliability   |
| Message Safety | ❌ Lost on crash        | ✅ Guaranteed until processed |

## 📜 Version Log

| Version  | Date       | Description                                                                                                                         |
| -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **v1.0** | 2025-10-09 | Initial setup: Temporary Python subscriber using fanout exchange with auto-ack (`auto_ack=True`).                                   |
| **v2.0** | 2025-10-09 | Added persistent subscriber: Named durable queue (`news-queue`) with manual acknowledgment (`auto_ack=False`) and durable exchange. |
| **v2.1** | TBD        | Future updates: Could include multiple subscribers, error handling, or logging enhancements.                                        |
