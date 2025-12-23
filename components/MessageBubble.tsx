import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Sender } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          relative max-w-[90%] md:max-w-[80%] rounded-2xl px-5 py-4 shadow-sm
          ${isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}
        `}
      >
        <div className="text-sm leading-7 markdown-content" dir="auto">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code(props: any) {
                const {children, className, node, ...rest} = props
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match && !String(children).includes('\n');
                
                return !isInline ? (
                  <div className="my-4 rounded-lg overflow-hidden border border-gray-700/50 shadow-sm bg-[#1e1e1e]" dir="ltr">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] border-b border-gray-700/50">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono lowercase opacity-75">
                        {match?.[1] || 'python'}
                      </span>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code {...rest} className={`${className} text-sm font-mono text-gray-200`}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code {...rest} className={`px-1.5 py-0.5 rounded text-[0.9em] font-mono border ${isUser ? 'bg-blue-700/50 border-blue-500/30' : 'bg-gray-100 text-red-600 border-gray-200'}`}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        <div 
          className={`text-[10px] mt-2 opacity-70 text-right ${isUser ? 'text-blue-100' : 'text-gray-400'}`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;