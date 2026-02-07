import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/server-store';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
