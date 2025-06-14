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

export const sessionId = uuidv4();
const clientId = 'Sma14N_67a056';

export async function initializeAPI(index: string, sopNamespace: string, kbNamespace: string): Promise<any> {
    try {
        const data = {
            index: index,
            sop_namespace: sopNamespace,
            kb_namespace: kbNamespace
        };

        console.log('Initializing API with data:', data);

        const response = await fetch('http://0.0.0.0:8000/api/init', {
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
        // Create FormData object
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('message', message);
        formData.append('feedback', feedback.toString());
        formData.append('channel', channel);
        
        // If there's an image, append it to formData
        if (image) {
            formData.append('image', image);
        }

        const response = await fetch('http://0.0.0.0:8000/api/chat', {
            method: 'POST',
            body: formData
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

export interface DummyToolParamItem {
  input_params: Record<string, any>;
  response_params: Record<string, any>;
}

export interface DummyToolDefinition {
  name: string;
  description: string;
  params_list: DummyToolParamItem[];
}

export interface DummyToolParams {
  session_id: string;
  run_id?: string;
  messages: any[];
  feedback: boolean;
  channel: string;
  client_id: string;
  client_config?: Record<string, any>;
  user_property?: Record<string, any>;
  dummy_tools?: DummyToolDefinition[];
  system_prompt?: string;
}

export async function sendDummyToolMessage(params: DummyToolParams): Promise<any> {
  try {
    const response = await fetch('http://0.0.0.0:8000/api/chat-dummy-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(`Server error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error sending dummy tool message:', error);
    throw error;
  }
}
  
