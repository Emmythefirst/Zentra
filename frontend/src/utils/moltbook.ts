import axios from 'axios';
import { Agent, MoltbookAgent, MoltbookPost, MoltbookComment } from '@/types';

const MOLTBOOK_API_BASE = 'https://www.moltbook.com/api/v1';
const API_KEY = import.meta.env.VITE_MOLTBOOK_API_KEY as string;

const moltbookClient = axios.create({
  baseURL: MOLTBOOK_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

// ============================================
// ZENTRA AGENT CONFIG
// ============================================

const ZENTRA_AGENT_NAMES = ['ZentraResearcher', 'ZentraScraper', 'ZentraAnalyst'];

// All 3 agents share the same worker bot wallet on Monad testnet
const AGENT_WALLETS: Record<string, string> = {
  ZentraResearcher: '0xE9f866cE1404Dd1d0949d9F67cb5Ff6030bdc255',
  ZentraScraper: '0xE9f866cE1404Dd1d0949d9F67cb5Ff6030bdc255',
  ZentraAnalyst: '0xE9f866cE1404Dd1d0949d9F67cb5Ff6030bdc255',
};

const AGENT_CATEGORIES: Record<string, string> = {
  ZentraResearcher: 'research',
  ZentraScraper: 'scraping',
  ZentraAnalyst: 'analysis',
};

const AGENT_SPECIALTIES: Record<string, string[]> = {
  ZentraResearcher: ['Research', 'Blockchain Analysis', 'Competitive Intelligence'],
  ZentraScraper: ['Web Scraping', 'Data Extraction', 'Price Monitoring'],
  ZentraAnalyst: ['Data Analysis', 'Content Summary', 'Report Generation'],
};

const AGENT_RATES: Record<string, number> = {
  ZentraResearcher: 15,
  ZentraScraper: 10,
  ZentraAnalyst: 12,
};

// ============================================
// MAPPER: Convert Moltbook API → Our Format
// ============================================

function mapMoltbookAgentToAgent(moltbookAgent: MoltbookAgent): Agent {
  const name = moltbookAgent.name;
  return {
    id: moltbookAgent.id || name,
    name,
    description: moltbookAgent.description || 'Active Zentra agent on Monad',
    avatar: moltbookAgent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
    karma: moltbookAgent.karma || 0,
    specialties: AGENT_SPECIALTIES[name] || ['General Tasks'],
    hourly_rate: AGENT_RATES[name] || 10,
    success_rate: 97,
    tasks_completed: moltbookAgent.stats?.posts || 0,
    verified: moltbookAgent.is_claimed || false,
    wallet_address: AGENT_WALLETS[name] || '',
    category: AGENT_CATEGORIES[name] || 'research',
    moltbook: moltbookAgent,
  };
}

// ============================================
// AGENT APIs
// ============================================

export async function fetchAgents(): Promise<Agent[]> {
  try {
    // Fetch only our 3 registered Zentra agents from Moltbook
    const agents = await Promise.all(
      ZENTRA_AGENT_NAMES.map(name => fetchAgentByName(name))
    );
    return agents;
  } catch (error) {
    console.error('Error fetching Zentra agents:', error);
    throw error;
  }
}

export async function fetchAgentByName(name: string): Promise<Agent> {
  try {
    const response = await moltbookClient.get(`/agents/profile?name=${name}`);
    const agent = response.data.agent;
    return mapMoltbookAgentToAgent(agent);
  } catch (error) {
    console.error(`Error fetching agent ${name}:`, error);
    throw error;
  }
}

export async function searchAgents(query: string): Promise<Agent[]> {
  try {
    const q = query.toLowerCase();
    // Search within our 3 agents only
    const all = await fetchAgents();
    return all.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.specialties.some(s => s.toLowerCase().includes(q))
    );
  } catch (error) {
    console.error('Error searching agents:', error);
    throw error;
  }
}

// ============================================
// POST APIs
// ============================================

export async function fetchPosts(submolt: string = 'zentra', limit: number = 20): Promise<MoltbookPost[]> {
  try {
    const response = await moltbookClient.get(`/submolts/${submolt}/feed?limit=${limit}`);
    return response.data.posts || response.data;
  } catch (error) {
    console.error(`Error fetching posts from m/${submolt}:`, error);
    throw error;
  }
}

export async function createPost(
  submolt: string,
  title: string,
  content: string,
  url?: string
): Promise<MoltbookPost> {
  try {
    const response = await moltbookClient.post('/posts', {
      submolt,
      title,
      content,
      url,
    });
    return response.data.post || response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function fetchPostById(postId: string): Promise<MoltbookPost> {
  try {
    const response = await moltbookClient.get(`/posts/${postId}`);
    return response.data.post || response.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
}

// ============================================
// COMMENT APIs
// ============================================

export async function fetchComments(postId: string): Promise<MoltbookComment[]> {
  try {
    const response = await moltbookClient.get(`/posts/${postId}/comments`);
    return response.data.comments || response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<MoltbookComment> {
  try {
    const response = await moltbookClient.post(`/posts/${postId}/comments`, {
      content,
      parent_id: parentId,
    });
    return response.data.comment || response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

// ============================================
// VOTING APIs
// ============================================

export async function upvotePost(postId: string): Promise<void> {
  try {
    await moltbookClient.post(`/posts/${postId}/upvote`);
  } catch (error) {
    console.error(`Error upvoting post ${postId}:`, error);
    throw error;
  }
}

export async function downvotePost(postId: string): Promise<void> {
  try {
    await moltbookClient.post(`/posts/${postId}/downvote`);
  } catch (error) {
    console.error(`Error downvoting post ${postId}:`, error);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAgentProfileUrl(agentName: string): string {
  return `https://www.moltbook.com/u/${agentName}`;
}

export function getPostUrl(submolt: string, postId: string): string {
  return `https://www.moltbook.com/m/${submolt}/posts/${postId}`;
}

export function getSubmoltUrl(submolt: string): string {
  return `https://www.moltbook.com/m/${submolt}`;
}

export function sortAgentsByKarma(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => b.karma - a.karma);
}

export function filterActiveAgents(agents: Agent[]): Agent[] {
  return agents.filter(agent => agent.verified);
}

export function filterVerifiedAgents(agents: Agent[]): Agent[] {
  return agents.filter(agent => agent.verified);
}