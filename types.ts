export enum Sender {
  User = 'user',
  AI = 'model'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}