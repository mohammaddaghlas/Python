import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender } from '../types';
import MessageBubble from './MessageBubble';
import { sendMessageToGemini } from '../services/geminiService';
import { INITIAL_MESSAGE } from '../constants';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: Sender.User,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const aiResponseText = await sendMessageToGemini(messages, userMessage.text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: Sender.AI,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-5xl mx-auto shadow-xl border-x border-gray-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
            Py
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">CAP Python Tutor</h1>
            <p className="text-xs text-gray-500 font-medium">Dr. Ahmed Alia's Curriculum</p>
          </div>
        </div>
        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 font-medium">
          Chapter 2, 3 & NumPy
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        <div className="space-y-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Python lists, functions, NumPy arrays, or probability..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm max-h-32 py-3 px-2 text-gray-700 placeholder-gray-400"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`
              mb-1 p-2 rounded-lg transition-all duration-200
              ${!inputText.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          AI strictly limited to CAP course material.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
