'use client';

import { User } from '@/lib/store';

interface NavbarProps {
  currentTab: 'votes' | 'create' | 'profile';
  onTabChange: (tab: 'votes' | 'create' | 'profile') => void;
  user: User;
}

export default function Navbar({ currentTab, onTabChange, user }: NavbarProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="rainbow-text cursor-pointer" onClick={() => onTabChange('votes')}>
              Vote
            </h1>
            <button
              onClick={() => onTabChange('votes')}
              className={`text-sm ${
                currentTab === 'votes' ? 'text-gray-900 font-medium' : 'text-gray-400'
              } hover:text-gray-900 transition-colors`}
            >
              투표들
            </button>
            <button
              onClick={() => onTabChange('create')}
              className={`text-sm ${
                currentTab === 'create' ? 'text-gray-900 font-medium' : 'text-gray-400'
              } hover:text-gray-900 transition-colors`}
            >
              투표 만들기
            </button>
          </div>
          <button
            onClick={() => onTabChange('profile')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue via-primary-purple to-primary-yellow text-white font-bold hover:opacity-80 transition-opacity"
          >
            {user.username.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
