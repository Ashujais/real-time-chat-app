export interface Message {
  id: string;
  username: string;
  message: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  error?: string;
}

export interface SocketEvents {
  'message:new': (message: Message) => void;
  'user:online': (data: { username: string; onlineUsers: string[] }) => void;
  'user:offline': (data: { username: string; onlineUsers: string[] }) => void;
  'user:typing': (data: { username: string }) => void;
  'user:stop-typing': (data: { username: string }) => void;
}
