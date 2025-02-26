'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Video, Phone, Folder, Smile, PlusCircle, Send } from 'lucide-react'
import { sendMessage, initializeAPI } from './api'
import EmojiPicker from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'
import ReactMarkdown from 'react-markdown'
import { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'  // Add this import

type Message = {
  id: number;
  sender: string;
  content: string;
  time: string;
  isSelf: boolean;
  showFeedback?: boolean;
  feedback?: boolean | null;
  imageUrl?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: 'Ray', 
      content: 'Hi, how can i assist you today?', 
      time: '12:44', 
      isSelf: false,
      showFeedback: true,
      feedback: null 
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [channel, setChannel] = useState('chat')
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializationRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const freshchatScriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Add new useEffect for initialization
  useEffect(() => {
    const initAPI = async () => {
      if (initializationRef.current) return;
      initializationRef.current = true;
      
      try {
        await initializeAPI(
          'default-index',           // replace with your index value
          'KAR001_LISGHP',     // replace with your sop_namespace value
          'KAR001_LISGHP'       // replace with your kb_namespace value
        );
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing API:', error);
        initializationRef.current = false; // Reset in case of error
      }
    };

    initAPI();
  }, []); // Empty dependency array since we're using ref

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only load the script once
      if (!freshchatScriptRef.current) {
        const script = document.createElement('script');
        script.src = '//in.fw-cdn.com/32284287/1230113.js';
        script.async = true;
        script.setAttribute('chat', 'true');
        script.setAttribute('data-fc-extension-id', 'your-extension-id');
        document.head.appendChild(script);
        freshchatScriptRef.current = script;
      }
    }, 1000); // Delay initialization

    return () => {
      clearTimeout(timer);
      // Only remove the script if it exists
      if (freshchatScriptRef.current) {
        document.head.removeChild(freshchatScriptRef.current);
        freshchatScriptRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      // Remove feedback buttons from previous messages
      const updatedMessages = messages.map(msg => ({
        ...msg,
        showFeedback: false
      }));

      // Add user message to UI immediately
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
        showFeedback: false
      }
      setMessages([...updatedMessages, newMessage])
      setInputMessage('')
      setIsTyping(true)  // Show typing indicator while waiting for response
      
      // Send message to API
      try {
        const response = await sendMessage(inputMessage, true, null, channel)
        console.log('Received response:', response)
        
        // Add AI response to messages
        setMessages(prevMessages => {
          const allMessagesWithoutFeedback = prevMessages.map(msg => ({
            ...msg,
            showFeedback: false
          }));
          
          return [...allMessagesWithoutFeedback, {
            id: prevMessages.length + 1,
            sender: 'Ray',
            content: response.reply || 'No response',  // Changed from response.reply || response.response
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
            showFeedback: true,
            feedback: null
          }];
        });
        
        setIsTyping(false)
      } catch (error) {
        console.error('Error sending message:', error)
        setIsTyping(false)
      }
    }
  }

  const handleFeedback = async (messageId: number, feedback: boolean) => {
    // First update all messages to hide feedback buttons
    setMessages(prevMessages =>
      prevMessages.map(msg => ({
        ...msg,
        showFeedback: false,
        feedback: msg.id === messageId ? feedback : msg.feedback
      }))
    );

    // Only proceed with API call if feedback is negative
    if (!feedback) {
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        try {
          const messageToSend = message.isSelf ? message.content : "";
          await sendMessage(messageToSend, feedback, null, channel);
        } catch (error) {
          console.error('Error sending feedback:', error);
        }
      }
    }
  };

  // Add key press handler for Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const markdownComponents: Components = {
    // Ensure inline code and block code are styled differently
    code: ({ className, children, ...props }: any) => {
      const isInline = !className;
      return (
        <code
          className={`${
            isInline 
              ? 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm' 
              : 'block bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-sm overflow-x-auto'
          } ${className || ''}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    // Ensure paragraphs are styled correctly
    p: ({ children, ...props }: any) => (
      <p className="mb-2 text-sm leading-normal" {...props}>{children}</p>
    ),
    // Ensure lists are styled correctly
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc pl-4 mb-2 text-sm space-y-2" {...props}>{children}</ul>
    ),
    li: ({ children, ...props }: any) => (
      <li className="marker:text-black leading-normal ml-4" {...props}>{children}</li>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold text-black" {...props}>{children}</strong>
    )
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a temporary URL for immediate image preview
      const tempImageUrl = URL.createObjectURL(file);
      
      // Show loading state in chat with image preview
      const tempMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: '',  // Empty content since we're showing the image
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
        showFeedback: false,
        imageUrl: tempImageUrl  // Show the image immediately
      };
      setMessages(prev => [...prev, tempMessage]);
      setIsTyping(true);

      // Send image using the existing API function
      const response = await sendMessage('', true, file, channel);

      if (!response) {
        throw new Error('No response from server');
      }

      // Clean up the temporary URL
      URL.revokeObjectURL(tempImageUrl);

      // Update messages to include both the image and the AI response
      setMessages(prevMessages => {
        const allMessagesWithoutFeedback = prevMessages.map(msg => ({
          ...msg,
          showFeedback: false
        }));

        // Update the user's image message with the server URL
        const updatedMessages = allMessagesWithoutFeedback.map(msg => 
          msg.id === tempMessage.id 
            ? {
                ...msg,
                imageUrl: response.imageUrl || tempImageUrl, // Fallback to temp URL if server URL not provided
              }
            : msg
        );

        // Add AI's response message
        const aiResponse = {
          id: prevMessages.length + 2,
          sender: 'Ray',
          content: response.reply || 'No response',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
          showFeedback: true,
          feedback: null
        };

        return [...updatedMessages, aiResponse];
      });

      setIsTyping(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === messages.length + 1
          ? {
              ...msg,
              content: 'Failed to upload image. Please try again.',
              imageUrl: undefined
            }
          : msg
      ));
      setIsTyping(false);
    }
  };

  return (
    <div className="flex justify-center w-full h-screen bg-gray-100 p-4">
      <div className="flex flex-col h-full max-w-3xl w-full border-x border-gray-200 bg-white rounded-lg">
        {/* Header */}
        <div className="bg-white p-2 flex items-center justify-between border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Ray" />
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-sm">Ray</h2>
              <span className="text-xs text-green-500 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                Online
              </span>
            </div>
          </div>
          
          {/* Add channel selector dropdown */}
          <select 
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-3 py-1 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="chat">Chat</option>
            <option value="freshdesk">Freshdesk</option>
          </select>

          <div className="flex space-x-2">
            <Button variant="ghost" size="icon"><Video className="h-5 w-5 text-blue-600" /></Button>
            <Button variant="ghost" size="icon"><Phone className="h-5 w-5 text-blue-600" /></Button>
            <Button variant="ghost" size="icon"><Folder className="h-5 w-5 text-blue-600" /></Button>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isSelf ? 'justify-end' : 'justify-start'}`}>
              {!message.isSelf && (
                <Avatar className="w-6 h-6 mr-2">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={message.sender} />
                  <AvatarFallback>{message.sender[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col">
                <div className={`max-w-xs ${message.isSelf ? 'bg-blue-500 text-white' : 'bg-white'} rounded-lg p-2 shadow`}>
                  {message.imageUrl ? (
                    <img 
                      src={message.imageUrl} 
                      alt="Uploaded content" 
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  ) : message.isSelf ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-neutral dark:prose-invert !text-black">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 mt-0.5 block">{message.time}</span>
                </div>
                {message.showFeedback && !message.isSelf && (
                  <div className="flex space-x-2 mt-1">
                    <button
                      onClick={() => handleFeedback(message.id, true)}
                      className={`p-1 rounded hover:bg-gray-100 ${message.feedback === true ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, false)}
                      className={`p-1 rounded hover:bg-gray-100 ${message.feedback === false ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      👎
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="px-4 py-1 text-sm text-gray-500">
            Ray is typing...
          </div>
        )}

        {/* Message input */}
        <div className="bg-white p-3 flex items-center space-x-2 border-t relative">
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-full mb-2 left-0">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5 text-gray-500" />
          </Button>
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload"
            onChange={handleImageUpload}
          />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <PlusCircle className="h-5 w-5 text-gray-500" />
          </Button>
          <Input
            type="text"
            placeholder="Type your message here..."
            value={inputMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon" className="bg-blue-500 hover:bg-blue-600">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
