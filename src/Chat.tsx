'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Video, Phone, Folder, Smile, PlusCircle, Send } from 'lucide-react'
import { sendMessage, receiveMessages } from './api'
import EmojiPicker from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'
import ReactMarkdown from 'react-markdown'
import { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'  // Add this import

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Ray', content: 'Hi, how can i assist you today?', time: '12:44', isSelf: false },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      // Add message to UI immediately
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true
      }
      setMessages([...messages, newMessage])
      setInputMessage('')
      
      // Send message to API
      try {
        console.log('Sending message:', inputMessage)
        const response = await sendMessage(inputMessage)
        console.log('Received response:', response)
        // Add AI response to messages
        setMessages(prevMessages => [...prevMessages, {
          id: prevMessages.length + 1,
          sender: 'Ray',
          content: response.reply || response.response || 'No response',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: false
        }])
        setIsTyping(false)
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

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
              <div className={`max-w-xs ${message.isSelf ? 'bg-blue-500 text-white' : 'bg-white'} rounded-lg p-2 shadow`}>
                {message.isSelf ? (
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
          <Button variant="ghost" size="icon"><PlusCircle className="h-5 w-5 text-gray-500" /></Button>
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
