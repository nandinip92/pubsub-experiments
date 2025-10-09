# Node.js Producer

This service is a **Kafka producer** built using **Express.js** and **KafkaJS**.  
It allows publishing messages to a Kafka topic through a simple HTTP API.

```bash
cd producer-js
npm init -y
npm install kafkajs express cors
```

Create `producer.js`:

```javascript
// Import required modules
import express from "express";   // Framework for creating HTTP APIs
import { Kafka } from "kafkajs"; // Kafka client library for Node.js
import cors from "cors";         // Middleware to enable Cross-Origin Resource Sharing

// Initialize an Express application
const app = express();

// Enable CORS for all routes (allows requests from different origins)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// -------------------------------------------
// 🔹 Kafka Configuration
// -------------------------------------------

// Create a Kafka instance (client) to connect to the Kafka broker
const kafka = new Kafka({
  clientId: "news-producer",       // A unique ID to identify this producer client
  brokers: ["localhost:9092"]      // The Kafka broker address (matches docker-compose)
});

// Producer instance
const producer = kafka.producer(); // Default partitioner is sufficient for 1 partition

// Admin client to manage topics programmatically
const admin = kafka.admin();
await admin.connect();

const TOPIC = "news-topic";  // The Kafka topic to publish messages to

// Check if the topic already exists; if not, create it
const topics = await admin.listTopics();
if (!topics.includes(TOPIC)) {
  await admin.createTopics({
    topics: [{ topic: TOPIC, numPartitions: 1, replicationFactor: 1 }],
  });
  console.log(`✅ Topic '${TOPIC}' created`);  // Log topic creation for confirmation
} else {
  console.log(`ℹ️ Topic '${TOPIC}' already exists`); // Log if topic already exists
}

// Disconnect admin client after topic management
await admin.disconnect();

// Connect the producer to the Kafka broker
await producer.connect();
console.log("✅ Producer connected to Kafka!");

// -------------------------------------------
// 🔹 API Routes
// -------------------------------------------

// Health check endpoint to verify the producer server is running
app.get("/", (req, res) => {
  res.send({ status: "Producer is running!" });
});

// POST endpoint to publish messages to Kafka
app.post("/publish", async (req, res) => {
  const { message } = req.body;  // Extract 'message' from the request body

  // Send the message to the Kafka topic
  await producer.send({ topic: TOPIC, messages: [{ value: message }] });

  // Log the published message for debugging and confirmation
  console.log("📤 Published:", message);

  // Respond to the client that the message was published successfully
  res.send({ status: "Message published!" });
});

// -------------------------------------------
// 🔹 Start the Express Server
// -------------------------------------------

// The API server listens on port 4002
app.listen(4002, () => console.log("🚀 Kafka producer running at http://localhost:4002"));

```

### Explaination

### ⚙️ Express Setup
- Creates a simple HTTP server that listens on **port 4002**.  
- Accepts **JSON payloads** and allows **cross-origin requests (CORS)** — useful when your frontend runs on another port.

### 🪄 Kafka Setup
- Connects to the **Kafka broker** at `localhost:9092`.  
- Initializes a **producer** instance that can send messages to Kafka topics.

### 🚀 Publish Endpoint (`POST /publish`)
- Receives a message (e.g. `{"message": "Breaking news!"}`) from the frontend or another service.  
- Publishes it to the Kafka topic **`news-topic`**.  
- Sends back a confirmation response once the message is successfully sent.

### 🧾 Logging
- Logs each published message to the console, helping you debug and verify successful delivery.

---

## 💡 Example Usage

You can test the Kafka producer using **curl** or **Postman**:

## Using curl

```bash
curl -X POST http://localhost:4002/publish \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello from Kafka!"}'
```

**Expected Console Output:**

```
Published: Hello from Kafka!
```

**API Response:**

```json
{
  "status": "Message published!"
}
```

## Using Postman

1. Open Postman and create a new **POST** request.
2. Set the URL to:

```
http://localhost:4002/publish
```

3. Under the **Headers** tab, add:

```
Key: Content-Type
Value: application/json
```

4. Under the **Body** tab, select **raw** and **JSON**, then enter:

```json
{
  "message": "Hello from Kafka!"
}
```

5. Click **Send**.
6. You should see the API response:

```json
{
  "status": "Message published!"
}
```

7. Check your terminal to see the logged message:

```
Published: Hello from Kafka!
```
