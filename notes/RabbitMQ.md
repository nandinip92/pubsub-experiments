# 🐇 RabbitMQ — Notes

## 📑 Table of Contents

- [Overview](#📘-overview)
- [Key Concepts](#🧩-key-concepts)
- [RabbitMQ Flow (Fanout Example)](#⚙️-rabbitmq-flow-fanout-example)
- [Exchange Types with ASCII Diagrams](#🧩-exchange-types-with-ascii-diagrams)
  - [Direct Exchange](#1️⃣-direct-exchange)
  - [Fanout Exchange](#2️⃣-fanout-exchange)
  - [Topic Exchange](#3️⃣-topic-exchange)
  - [Headers Exchange](#4️⃣-headers-exchange)
- [Basic Methods / Commands](#⚙️-basic-methods--commands)
- [Docker Setup](#🐳-docker-setup)
- [Useful AMQP Ports](#🧾-useful-amqp-ports)
- [What I Learned](#🧠-what-i-learned)
- [Strengths & Limitations](#⚖️-strengths--limitations)
- [When to Use RabbitMQ](#💡-when-to-use-rabbitmq)
- [Additional Resources](#📚-additional-resources)

## 📘 Overview

**RabbitMQ** is a **robust message broker** implementing the **AMQP protocol (Advanced Message Queuing Protocol)**.  
It allows services to communicate via **exchanges, queues, and bindings**, enabling **reliable, asynchronous messaging**.  
Publishers send messages to **exchanges**, which route them to **queues** based on type and routing rules. Subscribers consume messages from queues.

Unlike Redis Pub/Sub, RabbitMQ **supports persistence, acknowledgments, and advanced routing**, making it suitable for **reliable and scalable systems**.

---

## 🧩 Key Concepts

| Term            | Description                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| **Exchange**    | Receives messages from publishers and routes them to queues. Types include **direct, fanout, topic, headers**. |
| **Queue**       | Stores messages until consumers retrieve them. Can be durable or temporary.                                    |
| **Publisher**   | Sends messages to an exchange (not directly to a queue).                                                       |
| **Subscriber**  | Consumes messages from queues, optionally acknowledging receipt.                                               |
| **Binding**     | Connection between an exchange and a queue, defining **routing rules**.                                        |
| **Routing Key** | A string used by exchanges to decide which queues receive a message.                                           |

---

## ⚙️ RabbitMQ Flow (Fanout Example)

```text
          ┌─────────────┐
          │  Publisher  │
          │  (Node.js)  │
          └─────┬───────┘
                │  PUBLISH "news-exchange"
                ▼
        ┌─────────────────┐
        │ RabbitMQ Exchange│  (fanout)
        │ "news-exchange" │
        └───┬─────────┬───┘
            │         │
            ▼         ▼
   ┌─────────────┐ ┌─────────────┐
   │ Subscriber1 │ │ Subscriber2 │
   │  (Python)   │ │  (Python)   │
   └─────────────┘ └─────────────┘
```

- **Fanout Exchange:** Sends messages to all bound queues.
- **Subscribers:** Consume messages independently; offline subscribers **won’t miss messages** if queues are durable.

##🧩 Other Exchange Types

### 1️⃣ Direct Exchange

```bash
Exchange "direct-exchange"
    │
    ├─ Queue "email"   (routing key: "email")
    └─ Queue "sms"     (routing key: "sms")

Message with routing key "email" → delivered only to "email" queue
```

- Routes messages to queues where **routing key matches exactly**.
- Use case: task queues, targeted messages.

### 2️⃣ Fanout Exchange

```bash
Exchange "fanout-exchange"
    │
    ├─ Queue1
    └─ Queue2

Any message → delivered to all bound queues
```

- Ignores routing keys; broadcasts to **all queues**.
- Use case: notifications, real-time updates.

### 3️⃣ Topic Exchange

```bash
Exchange "topic-exchange"
    │
    ├─ Queue "kernels"   (binding key: "kern.*")
    └─ Queue "critical"  (binding key: "*.critical")

Message with routing key "kern.critical" → goes to both queues
```

- Routes messages using pattern matching.

  - - → matches exactly one word

  - # → matches zero or more words

- Use case: logs, hierarchical events, flexible routing.

### 4️⃣ Headers Exchange

```bash
Exchange "headers-exchange"
    │
    ├─ Queue1 {format: pdf, type: report}
    └─ Queue2 {format: csv, type: report}

Message headers {format: pdf, type: report} → delivered to Queue1 only
```

- Routes messages based on **message headers** instead of routing keys.
- Use case: complex filtering rules.

## ⚙️ Basic Methods / Commands

| Method / Command                                   | Description                                       |
| -------------------------------------------------- | ------------------------------------------------- |
| `channel.publish(exchange, key, Buffer.from(msg))` | Publish message to an exchange with a routing key |
| `channel.assertExchange(name, type, options)`      | Create an exchange if it doesn’t exist            |
| `channel.assertQueue(name, options)`               | Create a queue if it doesn’t exist                |
| `channel.bindQueue(queue, exchange, key)`          | Bind a queue to an exchange with a routing key    |
| `channel.consume(queue, callback)`                 | Start consuming messages from a queue             |
| `channel.ack(message)`                             | Acknowledge a message after processing            |
| `channel.nack(message)`                            | Reject a message (can be requeued or discarded)   |
| `connection.close()`                               | Close the connection to RabbitMQ                  |

## 🐳 Docker Setup

Run RabbitMQ locally with Docker:

```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672" # AMQP port
      - "15672:15672" # Management UI
```

Access Management UI: `http://localhost:15672` (default: guest/guest)

### 🧾 Useful AMQP Ports

| Port  | Purpose                              |
| ----- | ------------------------------------ |
| 5672  | AMQP protocol (publisher/subscriber) |
| 5671  | AMQP over TLS/SSL                    |
| 15672 | RabbitMQ Management UI (HTTP)        |

## 🧠 What I Learned

- RabbitMQ supports **durable queues, acknowledgments, and retries**.
- Different **exchange types** allow flexible routing strategies.
- **Producers and consumers are loosely coupled**, enabling distributed systems.
- Can handle **high fanout** scenarios reliably (unlike Redis Pub/Sub).
- Docker makes **local setup easy** with multiple services.

---

## ⚖️ Strengths & Limitations

| Strengths ✅                                | Limitations ⚠️                                 |
| ------------------------------------------- | ---------------------------------------------- |
| Reliable messaging with acknowledgments     | Slightly more complex to set up than Redis     |
| Supports persistence and durable queues     | Requires broker running separately             |
| Flexible routing via exchanges and bindings | Slower than Redis Pub/Sub for simple real-time |
| Handles multiple consumers efficiently      | Learning curve for AMQP concepts               |

---

## 💡 When to Use RabbitMQ

### ✅ Use when:

- Guaranteed delivery is required
- Messages need persistence or retry mechanisms
- Complex routing between multiple consumers is needed
- Loosely coupled distributed systems are built

### 🚫 Avoid when:

- You need **ultra-low-latency pub/sub** without persistence (use Redis Pub/Sub)
- Simple fire-and-forget messaging is enough

---

## 📚 Additional Resources

🔗 [RabbitMQ Docs](https://www.rabbitmq.com/documentation.html)  
🔗 [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)  
📺 [Fireship — RabbitMQ Crash Course](https://www.youtube.com/watch?v=deG25k3DoqU)  
💬 [RabbitMQ Explained (Medium)](https://medium.com/@timmc/rabbitmq-introduction-4854f0b4b57a)
