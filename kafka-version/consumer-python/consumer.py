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
