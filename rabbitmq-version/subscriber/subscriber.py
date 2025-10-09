import pika

RABBITMQ_URL = "amqp://guest:guest@localhost:5672"
EXCHANGE_NAME = "news-exchange"

params = pika.URLParameters(RABBITMQ_URL)
connection = pika.BlockingConnection(params)
channel = connection.channel()

# Create temporary queue and bind to fanout exchange
result = channel.queue_declare(queue="", exclusive=True)
queue_name = result.method.queue
channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='fanout')
channel.queue_bind(exchange=EXCHANGE_NAME, queue=queue_name)

print("Waiting for messages. Press CTRL+C to exit.")

def callback(ch, method, properties, body):
    print(f"[Subscriber] Received: {body.decode()}")

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
channel.start_consuming()
