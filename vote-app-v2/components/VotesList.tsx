'use client';

import { useState, useEffect, useMemo } from 'react';
import { Vote, store } from '@/lib/store';
import VoteCard from './VoteCard';

interface VotesListProps {
  userId: string;
  onVoteClick: (vote: Vote) => void;
}

type SortOption = 'popular' | 'newest' | 'oldest' | 'a-z' | 'z-a';
type FilterOption = 'not-participated' | 'participated' | 'active' | 'expired' | 'all';

export default function VotesList({ userId, onVoteClick }: VotesListProps) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterOption[]>(['all']);

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = () => {
    const allVotes = store.getVotes();
    setVotes(allVotes);
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
    let result = [...votes];

    // 검색 필터
    if (searchQuery) {
      result = result.filter(vote => 
        vote.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 카테고리 필터
    if (!filters.includes('all')) {
      result = result.filter(vote => {
        const hasVoted = store.hasUserVoted(vote.id, userId);
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
  }, [votes, searchQuery, sortBy, filters, userId]);

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'not-participated', label: '참여하지 않은 투표' },
    { value: 'participated', label: '참여한 투표' },
    { value: 'active', label: '기한이 남은 투표' },
    { value: 'expired', label: '기한이 지난 투표' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 space-y-4">
        <div className="flex justify-end">
          <input
            type="text"
            placeholder="투표 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue w-64"
          />
        </div>

        <div className="flex items-center justify-between">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedVotes.map(vote => {
          const hasVoted = store.hasUserVoted(vote.id, userId);
          const isExpired = vote.deadline ? new Date(vote.deadline) < new Date() : false;
          
          return (
            <VoteCard
              key={vote.id}
              vote={vote}
              hasVoted={hasVoted}
              isExpired={isExpired}
              onClick={() => onVoteClick(vote)}
            />
          );
        })}
      </div>

      {filteredAndSortedVotes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          조건에 맞는 투표가 없습니다.
        </div>
      )}
    </div>
  );
}
