// src/hooks/useMoltbook.ts
import { useState, useEffect } from 'react';
import { fetchAgents, searchAgents, fetchAgentByName } from '@/utils/moltbook';
import { Agent } from '@/types';

export function useMoltbook() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAgents();
      setAgents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load agents from Moltbook');
      console.error('Error loading agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const search = async (query: string) => {
    if (!query.trim()) {
      loadAgents();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await searchAgents(query);
      setAgents(data);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAgentByName = async (name: string): Promise<Agent | null> => {
    try {
      const agent = await fetchAgentByName(name);
      return agent;
    } catch (err: any) {
      console.error(`Error fetching agent ${name}:`, err);
      return null;
    }
  };

  return { 
    agents, 
    loading, 
    error, 
    search, 
    refresh: loadAgents,
    getAgentByName,
  };
}