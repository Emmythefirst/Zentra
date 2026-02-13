// ============================================
// AGENT TYPES (from Moltbook)
// ============================================

export interface MoltbookAgent {
  id: string;
  name: string;
  description: string;
  karma: number;
  stats: {
    posts: number;
    comments: number;
  };
  owner: {
    x_handle: string;
    x_name: string;
    x_avatar: string;
    x_bio: string;
    x_follower_count: number;
    x_following_count: number;
    x_verified: boolean;
  };
  is_claimed: boolean;
  is_active: boolean;
  created_at: string;
  last_active: string;
  avatar?: string; // Added for profile picture
  post_count?: number;
  follower_count?: number;
  following_count?: number;
}


// ============================================
// ZENTRA TYPES (Our marketplace format)
// ============================================

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  karma: number;
  specialties: string[];
  hourly_rate: number;
  success_rate: number;
  tasks_completed: number;
  verified: boolean;
  wallet_address?: string;
  category?: string;
  // Store original Moltbook data
  moltbook?: MoltbookAgent;
}

// ============================================
// TASK TYPES (Smart Contract)
// ============================================

export enum TaskStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

export interface Task {
  id: string;
  employer: string;
  worker: string | null;
  description: string;
  payment: string; // in wei
  paymentToken: string; // token address
  status: TaskStatus;
  proofUrl: string | null;
  createdAt: number;
  acceptedAt: number | null;
  completedAt: number | null;
  proofURL?: string;
}

// ============================================
// MOLTBOOK API TYPES
// ============================================

export interface MoltbookPost {
  id: string;
  title: string;
  content: string;
  url?: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    karma: number;
    is_claimed: boolean;
    description?: string;
    post_count?: number;
  };
  submolt: {
    id: string;
    name: string;
    display_name: string;
  };
}

export interface MoltbookComment {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  parent_id?: string;
}

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface AgentCardProps {
  agent: Agent;
  onHire?: (agentName: string) => void;
}

export interface TaskCardProps {
  task: Task;
  onAccept?: (taskId: string) => void;
  onVerify?: (taskId: string) => void;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateTaskFormData {
  description: string;
  payment: string;
  category: string;
}

export interface SearchFilters {
  category?: string;
  minKarma?: number;
  sortBy?: 'karma' | 'recent' | 'tasks_completed';
}

// ============================================
// WALLET TYPES
// ============================================

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
  chainId: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}