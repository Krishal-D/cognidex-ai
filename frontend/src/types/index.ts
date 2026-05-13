export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Document {
  id: number;
  document_name: string;
  status: 'pending' | 'indexing' | 'indexed' | 'failed';
  created_at: string;
}

export interface Conversation {
  id: number;
  conversation_name: string;
  document_id: number;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  message_content: string;
}

export interface Source {
  document: string;
  documentId: number;
  chunkIndex: number;
}

export interface AuthContextType {
  user: User | null
  accessToken: string | null
  loading: boolean
  error: string | null
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}
