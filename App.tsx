import React from 'react';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <main className="h-screen w-full bg-gray-100 md:py-4">
      <ChatInterface />
    </main>
  );
};

export default App;
