import { NextResponse } from 'next/server';
import { getVotes, saveVotes, VoteResponse } from '@/lib/server-store';

export async function POST(request: Request) {
  try {
    const { voteId, userId, selectedOptions, otherText } = await request.json();

    const votes = getVotes();
    const vote = votes.find(v => v.id === voteId);

    if (!vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // 이미 투표했는지 확인
    if (vote.responses.some(r => r.userId === userId)) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    const response: VoteResponse = {
      userId,
      selectedOptions,
      otherText,
      timestamp: new Date().toISOString(),
    };

    vote.responses.push(response);
    saveVotes(votes);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}
