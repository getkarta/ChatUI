// my-chat-app/src/api.ts

import { v4 as uuidv4 } from 'uuid';
const sessionId = uuidv4();
export async function initializeAPI(index: string, sopNamespace: string, kbNamespace: string): Promise<any> {
    try {
        const data = {
            index: index,
            sop_namespace: sopNamespace,
            kb_namespace: kbNamespace
        };

        const response = await fetch('http://localhost:8000/api/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error initializing API:', error);
    }
}

export async function sendMessage(message: string, feedback: boolean, image?: File | null, channel: string = 'chat'): Promise<any> {
    console.log('Sending message:', message);
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('message', message);
      formData.append('feedback', feedback.toString());
      formData.append('channel', channel);
      
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
    }
}
  
