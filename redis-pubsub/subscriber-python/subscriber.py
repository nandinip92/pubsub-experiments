import redis

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Create a PubSub instance and subscribe to a channel
pubsub = r.pubsub()
pubsub.subscribe('news-channel')

print("Subscribed to news-channel. Waiting for messages...")

# Listen for messages and print them
for message in pubsub.listen():
    if message['type'] == 'message':
        print(f"[PY SUBSCRIBER] Received: {message['data'].decode()}")
