'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, Vote, store } from '@/lib/store';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onVoteClick: (vote: Vote) => void;
}

type SortOption = 'popular' | 'newest' | 'oldest' | 'a-z' | 'z-a';
type FilterOption = 'not-participated' | 'participated' | 'active' | 'expired' | 'all';

export default function Profile({ user, onLogout, onVoteClick }: ProfileProps) {
  const [myVotes, setMyVotes] = useState<Vote[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterOption[]>(['all']);

  useEffect(() => {
    loadMyVotes();
  }, [user.id]);

  const loadMyVotes = async () => {
    const allVotes = await store.getVotes();
    const userVotes = allVotes.filter(vote => vote.creatorId === user.id);
    setMyVotes(userVotes);
  };

  const toggleFilter = (filter: FilterOption) => {
    if (filter === 'all') {
      setFilters(['all']);
    } else {
      const newFilters = filters.includes('all') 
        ? [filter]
        : filters.includes(filter)
        ? filters.filter(f => f !== filter)
        : [...filters.filter(f => f !== 'all'), filter];
      
      setFilters(newFilters.length === 0 ? ['all'] : newFilters);
    }
  };

  const filteredAndSortedVotes = useMemo(() => {
    let result = [...myVotes];

    // 카테고리 필터
    if (!filters.includes('all')) {
      result = result.filter(vote => {
        const hasVoted = store.hasUserVoted(vote.id, user.id);
        const isExpired = vote.deadline ? new Date(vote.deadline) < new Date() : false;

        return filters.some(filter => {
          switch (filter) {
            case 'not-participated':
              return !hasVoted;
            case 'participated':
              return hasVoted;
            case 'active':
              return !isExpired;
            case 'expired':
              return isExpired;
            default:
              return true;
          }
        });
      });
    }

    // 정렬
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.responses.length - a.responses.length);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'a-z':
        result.sort((a, b) => a.question.localeCompare(b.question));
        break;
      case 'z-a':
        result.sort((a, b) => b.question.localeCompare(a.question));
        break;
    }

    return result;
  }, [myVotes, sortBy, filters, user.id]);

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'not-participated', label: '참여하지 않은 투표' },
    { value: 'participated', label: '참여한 투표' },
    { value: 'active', label: '기한이 남은 투표' },
    { value: 'expired', label: '기한이 지난 투표' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-blue via-primary-purple to-primary-yellow flex items-center justify-center text-white text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600">
                  가입일: {new Date(user.joinDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>생성한 투표: {myVotes.length}개</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">만든 투표들</h2>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => toggleFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.includes(option.value)
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">정렬 기준:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="popular">인기순</option>
              <option value="newest">최신순</option>
              <option value="oldest">오래된 순</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {filteredAndSortedVotes.map(vote => {
            const isExpired = vote.deadline ? new Date(vote.deadline) < new Date() : false;
            
            return (
              <div
                key={vote.id}
                onClick={() => onVoteClick(vote)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-blue hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{vote.question}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span>응답: {vote.responses.length}명</span>
                      <span>•</span>
                      <span>생성: {new Date(vote.createdAt).toLocaleDateString('ko-KR')}</span>
                      {vote.deadline && (
                        <>
                          <span>•</span>
                          <span className={isExpired ? 'text-red-500' : ''}>
                            마감: {new Date(vote.deadline).toLocaleDateString('ko-KR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {isExpired && (
                    <span className="px-3 py-1 bg-gray-400 text-white text-xs rounded-full">
                      마감됨
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedVotes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            조건에 맞는 투표가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
