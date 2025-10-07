# Pub/Sub Experiments

This repository is my *hands-on journal* for learning **Publish/Subscribe messaging systems**, covering:

1. **Redis Pub/Sub** – simple, lightweight, perfect for beginners  
2. **RabbitMQ** – reliable message broker with queues and routing  
3. **Kafka** – distributed event streaming platform for scalable applications 

## 🚀 Goals
- Understand the Pub/Sub communication model
- Implement Pub/Sub using:
  - **Redis** (simple, lightweight)
  - **Kafka** (high-throughput, distributed)
  - **RabbitMQ** (reliable messaging)
- Use **Docker Compose** to simulate multi-service setups
- Compare performance and learning experience across systems

## 📂 Structure
- `redis-version/` → Redis-based Pub/Sub
- `kafka-version/` → Kafka-based Pub/Sub
- `rabbitmq-version/` → RabbitMQ-based Pub/Sub
- `notes/` → Conceptual notes and comparisons

```pgsql
pubsub-experiments/
├── README.md                     # Main overview and learning path
├── redis-version/
│   ├── README.md                 # Redis-specific README
│   ├── publisher-js/
│   │   ├── package.json
│   │   └── publisher.js
│   ├── subscriber-python/
│   │   ├── requirements.txt
│   │   └── subscriber.py
│   └── docker-compose.yml
├── rabbitmq-version/
│   ├── README.md                 # RabbitMQ-specific README
│   ├── publisher-js/
│   │   ├── package.json
│   │   └── publisher.js
│   ├── subscriber-python/
│   │   ├── requirements.txt
│   │   └── subscriber.py
│   └── docker-compose.yml
├── kafka-version/
│   ├── README.md                 # Kafka-specific README
│   ├── producer-js/
│   │   ├── package.json
│   │   └── producer.js
│   ├── consumer-python/
│   │   ├── requirements.txt
│   │   └── consumer.py
│   └── docker-compose.yml
└── notes/
    ├── redis-pubsub.md
    ├── rabbitmq-pubsub.md
    ├── kafka-pubsub.md
    └── comparison.md

```

## 🛠️ Tech Stack
- Node.js, Python
- Redis, Kafka, RabbitMQ
- Docker Compose

## ✅ Progress Log
| Date | Focus | Notes |
|------|-------|------|
| 2025-10-07 | Setup repo | Initialized folder structure |
| 2025-10-08 | Redis | Implemented JS publisher and Python subscriber |
| 2025-10-09 | Kafka | Implemented Node.js producer and Python consumer |
| 2025-10-10 | RabbitMQ | Implemented Node.js publisher and Python subscriber |

## 📘 Learning Path
| Step | System       | Focus |
|------|-------------|-------|
| 1    | Redis       | Basic Pub/Sub, channels, lightweight messaging |
| 2    | RabbitMQ    | Message broker, queues, exchanges, reliability |
| 3    | Kafka       | Event streaming, partitions, consumer groups, scalability |


## Summary Table

| System   | Complexity | Persistence | Use Case Focus                            |
| -------- | ---------- | ----------- | ----------------------------------------- |
| Redis    | Low        | No          | Learning Pub/Sub basics                   |
| RabbitMQ | Medium     | Yes         | Reliable messaging, queues, routing       |
| Kafka    | High       | Yes         | Scalable event streaming, analytics, logs |
