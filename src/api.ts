// my-chat-app/src/api.ts

import { v4 as uuidv4 } from 'uuid';

export enum ContentType {
  TEXT = "text",
  IMAGE = "image"
}

export interface MessageItem {
  content: string;
  content_type: ContentType;
  created_at: string;
}

export interface Message {
  session_id: string;
  messages: MessageItem[];
  feedback: boolean;
  channel: string;
  client_id: string;
  client_config: Record<string, any>;
  user_property: Record<string, any>;
}

const sessionId = uuidv4();
const clientId = 'Sma14N_67a056';

export async function initializeAPI(index: string, sopNamespace: string, kbNamespace: string): Promise<any> {
    try {
        const data = {
            index: index,
            sop_namespace: sopNamespace,
            kb_namespace: kbNamespace
        };

        console.log('Initializing API with data:', data);

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
    console.log('Sending message:', message, 'Feedback:', feedback);
    try {
      const currentTime = new Date().toISOString();
      
      // Create the message item
      const messageItem: MessageItem = {
        content: message,
        content_type: ContentType.TEXT,
        created_at: currentTime
      };

      // Create the full message object
      const messageData: Message = {
        session_id: sessionId,
        messages: [messageItem],
        feedback: feedback,
        channel: channel,
        client_id: clientId,
        client_config: {},
        user_property: {}
      };

      // Log the message data being sent
      console.log('Message data being sent to backend:', JSON.stringify(messageData, null, 2));

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
}
  
