'use client';

import { Vote } from '@/lib/store';

interface VoteCardProps {
  vote: Vote;
  hasVoted: boolean;
  isExpired: boolean;
  onClick: () => void;
}

export default function VoteCard({ vote, hasVoted, isExpired, onClick }: VoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6 border-2 border-gray-100 hover:border-primary-blue"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
        {vote.question}
      </h3>
      <div className="space-y-2 text-sm text-gray-600">
        <p>선택지: {vote.options.length}개{vote.hasOther && ' + 기타'}</p>
        <p>
          선택 방식: {vote.selectionType === 'fixed' 
            ? `${vote.selectionCount}개 선택` 
            : '복수 선택'}
        </p>
        {vote.deadline && (
          <p className={isExpired ? 'text-red-500' : 'text-green-600'}>
            마감: {formatDate(vote.deadline)} {isExpired && '(마감됨)'}
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        {hasVoted && (
          <span className="px-3 py-1 bg-primary-yellow text-white text-xs rounded-full">
            참여 완료
          </span>
        )}
        {isExpired && (
          <span className="px-3 py-1 bg-gray-400 text-white text-xs rounded-full">
            마감됨
          </span>
        )}
      </div>
    </div>
  );
}
