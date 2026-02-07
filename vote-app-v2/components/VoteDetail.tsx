'use client';

import { useState, useEffect } from 'react';
import { Vote, VoteStats, store } from '@/lib/store';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VoteDetailProps {
  vote: Vote;
  userId: string;
  onBack: () => void;
}

export default function VoteDetail({ vote, userId, onBack }: VoteDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [otherText, setOtherText] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  const isCreator = vote.creatorId === userId;
  const isExpired = vote.deadline ? new Date(vote.deadline) < new Date() : false;

  useEffect(() => {
    const voted = store.hasUserVoted(vote.id, userId);
    setHasVoted(voted);
    if (voted || isCreator) {
      loadStats();
      setShowStats(true);
    }
  }, [vote.id, userId, isCreator]);

  const loadStats = () => {
    const voteStats = store.getVoteStats(vote.id);
    setStats(voteStats);
  };

  const handleOptionToggle = (index: number) => {
    if (hasVoted || isExpired) return;

    if (vote.selectionType === 'fixed') {
      if (selectedOptions.includes(index)) {
        setSelectedOptions(selectedOptions.filter(i => i !== index));
      } else if (selectedOptions.length < (vote.selectionCount || 1)) {
        setSelectedOptions([...selectedOptions, index]);
      }
    } else {
      if (selectedOptions.includes(index)) {
        setSelectedOptions(selectedOptions.filter(i => i !== index));
      } else {
        setSelectedOptions([...selectedOptions, index]);
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) return;
    
    if (vote.selectionType === 'fixed' && selectedOptions.length !== (vote.selectionCount || 1)) {
      alert(`정확히 ${vote.selectionCount}개를 선택해주세요.`);
      return;
    }

    try {
      await store.submitVoteResponse(vote.id, userId, selectedOptions, otherText || undefined);
      setHasVoted(true);
      loadStats();
      setShowStats(true);
    } catch (error: any) {
      alert(error.message || '투표 제출에 실패했습니다.');
    }
  };

  const canSubmit = () => {
    if (hasVoted || isExpired) return false;
    if (selectedOptions.length === 0) return false;
    if (vote.selectionType === 'fixed') {
      return selectedOptions.length === (vote.selectionCount || 1);
    }
    return true;
  };

  const COLORS = ['#4F46E5', '#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const renderVotingInterface = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          {vote.selectionType === 'fixed' 
            ? `${vote.selectionCount}개를 선택해주세요` 
            : '1개 이상 선택해주세요'}
        </p>
      </div>
      {vote.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleOptionToggle(index)}
          disabled={hasVoted || isExpired}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            selectedOptions.includes(index)
              ? 'border-primary-yellow bg-yellow-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          } ${(hasVoted || isExpired) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{option}</span>
            {selectedOptions.includes(index) && (
              <span className="text-primary-yellow">✓</span>
            )}
          </div>
        </button>
      ))}
      {vote.hasOther && (
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기타:
          </label>
          <input
            type="text"
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              if (e.target.value && !selectedOptions.includes(vote.options.length)) {
                setSelectedOptions([...selectedOptions, vote.options.length]);
              } else if (!e.target.value && selectedOptions.includes(vote.options.length)) {
                setSelectedOptions(selectedOptions.filter(i => i !== vote.options.length));
              }
            }}
            disabled={hasVoted || isExpired}
            placeholder="직접 입력해주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:bg-gray-100"
          />
        </div>
      )}
      {canSubmit() && (
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-primary-blue via-primary-purple to-primary-yellow text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          제출하기
        </button>
      )}
    </div>
  );

  const renderStats = () => {
    if (!stats) return null;

    const pieData = vote.options.map((option, index) => ({
      name: option,
      value: stats.optionCounts[index],
    })).filter(item => item.value > 0);

    const barData = vote.options.map((option, index) => ({
      name: option.length > 15 ? option.substring(0, 15) + '...' : option,
      votes: stats.optionCounts[index],
    }));

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-lg font-semibold text-gray-800">
            총 투표 수: {stats.totalVotes}명
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">원 그래프</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">막대 그래프</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="votes" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {vote.hasOther && stats.otherResponses.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">기타 응답</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {stats.otherResponses.map((response, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                  {response}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={onBack}
          className="mb-6 text-primary-blue hover:text-primary-purple flex items-center gap-2"
        >
          ← 돌아가기
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{vote.question}</h1>
          
          {vote.deadline && (
            <p className={`text-sm mb-4 ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
              마감: {new Date(vote.deadline).toLocaleDateString('ko-KR')} {isExpired && '(마감됨)'}
            </p>
          )}

          {showStats ? renderStats() : renderVotingInterface()}
        </div>
      </div>
    </div>
  );
}
