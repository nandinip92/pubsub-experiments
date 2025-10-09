# Python Consumer

This service is a **Kafka consumer** built using **Python** and the **kafka-python** library.
It listens to a Kafka topic and prints incoming messages to the console.

```bash
# Create a virtual environment and install kafka-python
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install kafka-python
```

Create `consumer.py`:

```python
from kafka import KafkaConsumer

# Kafka topic to subscribe to
TOPIC = "news-topic"

# Create Kafka consumer
consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers=['localhost:9092'],   # Kafka broker
    auto_offset_reset='earliest',           # Start from earliest message if no offset exists
    group_id='news-group',                   # Consumer group ID
    enable_auto_commit=True                  # Automatically commit offsets
)

print("⏳ Waiting for messages...")

# Listen for messages indefinitely
for message in consumer:
    print(f"📥 [Consumer] Received: {message.value.decode()}")
```

### Explanation

### 🪄 Kafka Consumer Setup

* Connects to the Kafka broker at `localhost:9092`.
* Subscribes to the topic **`news-topic`**.
* Uses a **consumer group** (`news-group`) to coordinate consumption across multiple consumers.
* Starts reading from the **earliest** message if no offsets are committed.

### 🚀 Consuming Messages

* Listens continuously for new messages.
* Decodes the message from bytes to string.
* Prints each message to the console with a `[Consumer]` prefix.

### ⏳ Logging

* Displays a waiting message initially.
* Prints each received message with an emoji for clarity.

---

## 💡 Example Usage

### Run the consumer

```bash
python consumer.py
```

**Expected Console Output (after producer sends messages):**

```
⏳ Waiting for messages...
📥 [Consumer] Received: Hello from Kafka!
📥 [Consumer] Received: Breaking news!
```

This consumer will keep running, waiting for new messages published to `news-topic`.
