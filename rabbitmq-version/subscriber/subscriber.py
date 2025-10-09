import pika

RABBITMQ_URL = "amqp://guest:guest@localhost:5672"
EXCHANGE_NAME = "news-exchange"
QUEUE_NAME = "persistent-news-queue"  # named queue

# Connect to RabbitMQ
params = pika.URLParameters(RABBITMQ_URL)
connection = pika.BlockingConnection(params)
channel = connection.channel()

# Declare a durable queue and fanout exchange
channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type="fanout", durable=True)
channel.queue_declare(queue=QUEUE_NAME, durable=True)

# Bind the queue to the exchange
channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME)

print("Waiting for persistent messages. Press CTRL+C to exit.")

def callback(ch, method, properties, body):
    print(f"[Persistent Subscriber] Received: {body.decode()}")
    ch.basic_ack(delivery_tag=method.delivery_tag)  # manual ack

channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback, auto_ack=False)
channel.start_consuming()