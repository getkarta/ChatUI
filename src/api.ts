// my-chat-app/src/api.ts

interface Message {
  session_id: string;
  message: string;
}

export async function sendMessage(message: string): Promise<any> {
    console.log('Sending message:', message);
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: 'your_session_id', 'message':message }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  
  export async function receiveMessages(): Promise<Message[]> {
    try {
      const response = await fetch('http://localhost:8001/api/chat');
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure an array is returned
    } catch (error) {
      console.error('Error receiving messages:', error);
      return []; // Return an empty array on error
    }
  }
