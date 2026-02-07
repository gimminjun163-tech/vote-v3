'use client';

import { useState } from 'react';
import { Vote, store } from '@/lib/store';

interface CreateVoteProps {
  userId: string;
  onVoteCreated: () => void;
}

export default function CreateVote({ userId, onVoteCreated }: CreateVoteProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [hasOther, setHasOther] = useState(false);
  const [selectionType, setSelectionType] = useState<'fixed' | 'multiple'>('fixed');
  const [selectionCount, setSelectionCount] = useState(1);
  const [deadline, setDeadline] = useState('');

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }

    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      alert('최소 2개의 선택지를 입력해주세요.');
      return;
    }

    if (selectionType === 'fixed' && (selectionCount < 1 || selectionCount > filledOptions.length)) {
      alert(`선택 개수는 1부터 ${filledOptions.length} 사이여야 합니다.`);
      return;
    }

    try {
      await store.saveVote({
        creatorId: userId,
        question: question.trim(),
        options: filledOptions,
        hasOther,
        selectionType,
        selectionCount: selectionType === 'fixed' ? selectionCount : undefined,
        deadline: deadline || undefined,
      });
      
      // 폼 초기화
      setQuestion('');
      setOptions(['', '']);
      setHasOther(false);
      setSelectionType('fixed');
      setSelectionCount(1);
      setDeadline('');

      alert('투표가 생성되었습니다!');
      onVoteCreated();
    } catch (error: any) {
      alert(error.message || '투표 생성에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">투표 만들기</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              질문 *
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="투표 질문을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선택 형식 *
            </label>
            <select
              value={selectionType}
              onChange={(e) => setSelectionType(e.target.value as 'fixed' | 'multiple')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="fixed">일정 수 선택</option>
              <option value="multiple">복수 선택</option>
            </select>
          </div>

          {selectionType === 'fixed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선택 개수 *
              </label>
              <input
                type="number"
                min="1"
                value={selectionCount}
                onChange={(e) => setSelectionCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선택지 * (최소 2개)
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`선택지 ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              + 선택지 추가
            </button>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasOther}
                onChange={(e) => setHasOther(e.target.checked)}
                className="w-4 h-4 text-primary-blue focus:ring-primary-blue"
              />
              <span className="text-sm font-medium text-gray-700">
                기타 선택지 추가하기
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              마감일 (선택사항)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-blue via-primary-purple to-primary-yellow text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            투표 만들기
          </button>
        </form>
      </div>
    </div>
  );
}
