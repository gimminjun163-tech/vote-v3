export interface User {
  id: string;
  username: string;
  password: string;
  joinDate: string;
}

export interface Vote {
  id: string;
  creatorId: string;
  question: string;
  options: string[];
  hasOther: boolean;
  selectionType: 'fixed' | 'multiple';
  selectionCount?: number;
  deadline?: string;
  createdAt: string;
  responses: VoteResponse[];
}

export interface VoteResponse {
  userId: string;
  selectedOptions: number[];
  otherText?: string;
  timestamp: string;
}

export interface VoteStats {
  optionCounts: number[];
  otherResponses: string[];
  totalVotes: number;
}

class Store {
  private cachedVotes: Vote[] = [];
  
  // User methods
  async register(username: string, password: string): Promise<User> {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    return data.user;
  }

  async login(username: string, password: string): Promise<User> {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    return data.user;
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('current_user');
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  }

  // Vote methods
  async getVotes(): Promise<Vote[]> {
    const response = await fetch('/api/votes');
    const data = await response.json();
    this.cachedVotes = data.votes || [];
    return this.cachedVotes;
  }

  async saveVote(voteData: Omit<Vote, 'id' | 'createdAt' | 'responses'>): Promise<Vote> {
    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voteData),
    });
    
    const data = await response.json();
    return data.vote;
  }

  getVoteById(id: string): Vote | null {
    return this.cachedVotes.find(v => v.id === id) || null;
  }

  hasUserVoted(voteId: string, userId: string): boolean {
    const vote = this.getVoteById(voteId);
    if (!vote) return false;
    return vote.responses.some(r => r.userId === userId);
  }

  async submitVoteResponse(voteId: string, userId: string, selectedOptions: number[], otherText?: string): Promise<void> {
    const response = await fetch('/api/votes/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteId, userId, selectedOptions, otherText }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit vote');
    }
    
    // 캐시 업데이트
    await this.getVotes();
  }

  getVoteStats(voteId: string): VoteStats | null {
    const vote = this.getVoteById(voteId);
    if (!vote) return null;

    const optionCounts = new Array(vote.options.length).fill(0);
    const otherResponses: string[] = [];

    vote.responses.forEach(response => {
      response.selectedOptions.forEach(optionIndex => {
        if (optionIndex < vote.options.length) {
          optionCounts[optionIndex]++;
        }
      });
      if (response.otherText) {
        otherResponses.push(response.otherText);
      }
    });

    return {
      optionCounts,
      otherResponses,
      totalVotes: vote.responses.length,
    };
  }
}

export const store = new Store();
