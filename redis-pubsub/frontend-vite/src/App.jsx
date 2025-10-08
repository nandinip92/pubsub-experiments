import { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (!message) return;

    try {
      await fetch('http://localhost:4000/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Redis Pub/Sub Demo</h2>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter news message"
        style={{ padding: '0.5rem', width: '300px' }}
      />
      <button
        onClick={sendMessage}
        style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
      >
        Send
      </button>
    </div>
  );
}

export default App;
