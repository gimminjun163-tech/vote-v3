'use client';

import { useState, useEffect } from 'react';
import { User, Vote, store } from '@/lib/store';
import Auth from '@/components/Auth';
import Navbar from '@/components/Navbar';
import VotesList from '@/components/VotesList';
import CreateVote from '@/components/CreateVote';
import Profile from '@/components/Profile';
import VoteDetail from '@/components/VoteDetail';

type Tab = 'votes' | 'create' | 'profile';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>('votes');
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);

  useEffect(() => {
    // 로그인 상태 확인
    const user = store.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (user: User) => {
    store.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    store.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentTab('votes');
  };

  const handleVoteClick = (vote: Vote) => {
    setSelectedVote(vote);
  };

  const handleBackToList = () => {
    setSelectedVote(null);
  };

  const handleVoteCreated = () => {
    setCurrentTab('votes');
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  if (selectedVote) {
    return (
      <VoteDetail
        vote={selectedVote}
        userId={currentUser.id}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={currentUser}
      />

      <main>
        {currentTab === 'votes' && (
          <VotesList
            userId={currentUser.id}
            onVoteClick={handleVoteClick}
          />
        )}

        {currentTab === 'create' && (
          <CreateVote
            userId={currentUser.id}
            onVoteCreated={handleVoteCreated}
          />
        )}

        {currentTab === 'profile' && (
          <Profile
            user={currentUser}
            onLogout={handleLogout}
            onVoteClick={handleVoteClick}
          />
        )}
      </main>
    </div>
  );
}
