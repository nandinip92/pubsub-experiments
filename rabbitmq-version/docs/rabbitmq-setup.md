# setup.md

# 🐇 RabbitMQ Pub/Sub Example — Setup Guide

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Step 1 — Docker Compose for RabbitMQ](#step-1-—-docker-compose-for-rabbitmq)
- [Step 2 — Node.js Publisher](#step-2-—-nodejs-publisher)
- [Step 3 — Python Subscriber](#step-3-—-python-subscriber)
- [Key Points](#key-points)

---

## Overview

This project demonstrates a **RabbitMQ Pub/Sub setup** with:

- **Publisher**: Node.js Express API publishing messages to a fanout exchange.
- **Subscriber**: Python script consuming messages from a queue (temporary or persistent).
- **Exchange Type**: Fanout — broadcasts messages to all bound queues.
- **Purpose**: Learn real-time messaging and loosely coupled communication.

---

## Architecture

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
   │ queue       │ │ queue       │
   └─────────────┘ └─────────────┘
```

---

## Step 1 — Docker Compose for RabbitMQ

```yaml
version: "3.8"

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672" # AMQP port
      - "15672:15672" # Web management UI
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

Start RabbitMQ:

```bash
docker compose up -d
```

Open management UI: `http://localhost:15672` → login `guest/guest`

---

## Step 2 — Node.js Publisher

Refer to [`publisher.md`](./rabbitMQ-publisher.md) for full code and explanations.

---

## Step 3 — Python Subscriber

Refer to [`subscriber.md`](./rabbitMQ-subscriber.md) for full code and explanations.
