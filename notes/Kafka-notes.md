# 🦄 Apache Kafka — Notes

## 📑 Table of Contents

- [Overview](#📘-overview)
- [Key Concepts](#🧩-key-concepts)
- [Kafka Flow (Producer → Broker → Consumer)](#⚙️-kafka-flow-producer--broker--consumer)
- [Core Components](#🧱-core-components)
- [Basic Commands](#⚙️-basic-commands)
- [Docker Setup](#🐳-docker-setup)
- [Kafka Ports](#🧾-kafka-ports)
- [What I Learned](#🧠-what-i-learned)
- [Strengths & Limitations](#⚖️-strengths--limitations)
- [When to Use Kafka](#💡-when-to-use-kafka)
- [Additional Resources](#📚-additional-resources)

---

## 📘 Overview

**Apache Kafka** is a **distributed event streaming platform** designed for **high-throughput, fault-tolerant, real-time data pipelines**.  
It acts as a **durable commit log**, allowing systems to **publish (write)** and **subscribe (read)** to streams of records.

Unlike RabbitMQ, Kafka is built for **scalability and throughput**, not complex routing.  
Messages are persisted on disk, allowing **replayability** and **horizontal scalability** across brokers.

Kafka is used by companies like LinkedIn, Uber, and Netflix for **real-time analytics, event sourcing, and log aggregation**.

---

## 🧩 Key Concepts

| Term             | Description                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| **Topic**        | A named stream of records (like a queue). Producers write to topics, consumers read from them.               |
| **Partition**    | Topics are split into partitions for parallelism and scalability. Each partition is an **ordered log**.      |
| **Offset**       | The position of a record within a partition — used to track consumption progress.                            |
| **Producer**     | Publishes data (events/messages) to Kafka topics.                                                            |
| **Consumer**     | Subscribes to topics and reads records from partitions.                                                      |
| **Consumer Group** | A group of consumers that share partitions to scale horizontally. Each partition is read by one consumer in the group. |
| **Broker**       | A Kafka server that stores and serves topic data.                                                            |
| **Zookeeper / KRaft** | Manages cluster metadata (Zookeeper in older versions, **KRaft** mode replaces it in newer ones).         |

---

## ⚙️ Kafka Flow (Producer → Broker → Consumer)

```text
          ┌─────────────┐
          │  Producer   │
          │ (Node.js)   │
          └─────┬───────┘
                │  PUBLISH "activity-topic"
                ▼
         ┌──────────────────┐
         │  Kafka Cluster   │
         │  (3 Brokers)     │
         └──┬─────────┬─────┘
            │         │
            ▼         ▼
   ┌─────────────┐ ┌─────────────┐
   │ Consumer A  │ │ Consumer B  │
   │  (Python)   │ │  (Python)   │
   └─────────────┘ └─────────────┘
```

- Producers send messages to **topics**.
- Kafka stores them in **partitions**.
- Consumers read them in **order per partition**.
- Kafka **retains** messages for a configurable time, even if they are consumed.

---

## 🧱 Core Components

### 🧾 Topics & Partitions

- Each **topic** is divided into **partitions** for scalability.
- Each message gets an **offset** within the partition.
- Ordering is guaranteed **within a single partition**, not across the topic.

```text
Topic: activity-logs
Partition 0 → [0, 1, 2, 3, 4]
Partition 1 → [0, 1, 2]
Partition 2 → [0, 1, 2, 3]
```

### 👥 Consumer Groups

- Each consumer group reads from the topic **collectively**.
- Kafka ensures **one consumer per partition** in a group.
- Allows parallel processing while maintaining order per partition.

```text
Group: analytics-group
 ├── Consumer-1 → Partition-0
 ├── Consumer-2 → Partition-1
 └── Consumer-3 → Partition-2
```

### 🧍‍♂️ Offsets

- Consumers maintain an **offset** to remember their last read message.
- Kafka stores offsets in a special internal topic: `__consumer_offsets`.

---

## ⚙️ Basic Commands

| Command | Description |
| -------- | ----------- |
| `kafka-topics.sh --create --topic my-topic --partitions 3 --replication-factor 1 --bootstrap-server localhost:9092` | Create a topic |
| `kafka-topics.sh --list --bootstrap-server localhost:9092` | List all topics |
| `kafka-console-producer.sh --topic my-topic --bootstrap-server localhost:9092` | Start a producer console |
| `kafka-console-consumer.sh --topic my-topic --from-beginning --bootstrap-server localhost:9092` | Start a consumer console |
| `kafka-topics.sh --describe --topic my-topic --bootstrap-server localhost:9092` | View topic details |

---

## 🐳 Docker Setup

Example `docker-compose.yml` for Kafka (using Bitnami images):

```yaml
services:
  zookeeper:
    image: bitnami/zookeeper:latest
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes
    ports:
      - "2181:2181"

  kafka:
    image: bitnami/kafka:latest
    environment:
      - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
      - ALLOW_PLAINTEXT_LISTENER=yes
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper
```

Run:
```bash
docker-compose up -d
```

Check topics:
```bash
docker exec -it <kafka-container> kafka-topics.sh --list --bootstrap-server localhost:9092
```

---

## 🧾 Kafka Ports

| Port  | Purpose               |
| ----- | --------------------- |
| 9092  | Kafka broker (plaintext) |
| 9093  | Kafka broker (SSL)    |
| 2181  | Zookeeper (metadata)  |

---

## 🧠 What I Learned

- Kafka focuses on **scalability, fault-tolerance, and durability** rather than complex routing.
- Topics and partitions enable **massive parallelism** and high throughput.
- Kafka **stores** data for a period, allowing **message replay** and **late consumers**.
- Works best for **streaming, event sourcing, and analytics pipelines**.
- **Consumer groups** help distribute load evenly among workers.

---

## ⚖️ Strengths & Limitations

| Strengths ✅                                      | Limitations ⚠️                                  |
| ------------------------------------------------- | ------------------------------------------------ |
| Extremely high throughput (millions of messages/s) | No advanced routing like RabbitMQ               |
| Horizontal scalability via partitions             | Requires more setup (Zookeeper / KRaft)         |
| Message persistence & replay                      | Not ideal for request/response or RPC patterns  |
| Strong ordering within partitions                 | Consumers must handle partition assignment logic |
| Excellent for stream processing (Kafka Streams)   | Harder to monitor manually vs RabbitMQ UI        |

---

## 💡 When to Use Kafka

### ✅ Use when:
- You need **high-throughput** message ingestion.
- Messages must be **durable and replayable**.
- You’re building **real-time analytics or event-driven pipelines**.
- You need to scale horizontally with **multiple consumers**.

### 🚫 Avoid when:
- You need **low-latency point-to-point messaging** (use RabbitMQ).
- You require **complex routing logic** or **per-message acknowledgment**.
- You just need **simple pub/sub** without persistence (use Redis Pub/Sub).

---

## 📚 Additional Resources

🔗 [Apache Kafka Docs](https://kafka.apache.org/documentation/)  
🔗 [Kafka Quickstart](https://kafka.apache.org/quickstart)  
📺 [Confluent Kafka Explained](https://www.youtube.com/watch?v=UNUz1-msbOM)  
📘 [Kafka: The Definitive Guide (Book)](https://www.confluent.io/resources/kafka-the-definitive-guide/)  
💬 [Medium — Kafka vs RabbitMQ](https://medium.com/@tobiasmarx/kafka-vs-rabbitmq-9c51e364f95d)
