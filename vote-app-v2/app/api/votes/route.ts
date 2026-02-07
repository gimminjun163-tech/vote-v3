import { NextResponse } from 'next/server';
import { getVotes, saveVotes, Vote } from '@/lib/server-store';

// 투표 목록 조회
export async function GET() {
  try {
    const votes = getVotes();
    return NextResponse.json({ votes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// 투표 생성
export async function POST(request: Request) {
  try {
    const voteData = await request.json();

    const votes = getVotes();
    const newVote: Vote = {
      ...voteData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      responses: [],
    };

    votes.push(newVote);
    saveVotes(votes);

    return NextResponse.json({ vote: newVote });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
  }
}
