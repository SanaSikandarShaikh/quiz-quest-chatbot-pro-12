
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { geminiService } from '../services/geminiService';
import { localStorageDB, ChatHistory } from '../services/localStorageDB';
import ChatMessage from './ChatMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, History, Settings } from 'lucide-react';

const GeminiChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId] = useState(`chat_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load welcome message
    addBotMessage("Welcome to our sophisticated AI-powered conversational platform. I'm here to assist you with comprehensive responses and intelligent discourse on any topic you wish to explore. Experience cutting-edge artificial intelligence technology designed for professional and academic excellence.");
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (content: string, isTyping: boolean = false) => {
    const message: ChatMessageType = {
      id: `bot_${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      isTyping,
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessageType = {
      id: `user_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const saveChatToHistory = async (userMsg: string, botMsg: string) => {
    const chatHistory: ChatHistory = {
      id: currentChatId,
      messages: [
        { role: 'user', content: userMsg, timestamp: new Date() },
        { role: 'assistant', content: botMsg, timestamp: new Date() }
      ],
      createdAt: new Date()
    };
    await localStorageDB.saveChatHistory(chatHistory);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addUserMessage(userMessage);
    setIsLoading(true);

    try {
      const response = await geminiService.generateResponse(userMessage);
      addBotMessage(response.text);
      await saveChatToHistory(userMessage, response.text);
    } catch (error) {
      addBotMessage('I apologize, but I encountered a technical difficulty. Please ensure our backend infrastructure is operational on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Advanced AI Conversational Platform
              </h1>
              <Bot className="w-8 h-8 text-blue-600 ml-3" />
            </div>
            <p className="text-gray-600 text-lg">Experience sophisticated artificial intelligence with seamless local infrastructure deployment</p>
            <p className="text-gray-500 text-sm mt-2">Powered by cutting-edge neural networks and state-of-the-art language processing capabilities</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 h-[600px] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
              <h3 className="text-white font-semibold text-lg flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                Intelligent Conversational Assistant
              </h3>
              <p className="text-blue-100 text-sm">Leveraging advanced machine learning algorithms for exceptional discourse</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Bot className="w-5 h-5 animate-pulse" />
                  <span className="text-sm">Processing your inquiry through our sophisticated neural network architecture...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex space-x-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Engage in sophisticated discourse with our advanced AI system..."
                  className="flex-1 min-h-[50px] resize-none border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatInterface;
