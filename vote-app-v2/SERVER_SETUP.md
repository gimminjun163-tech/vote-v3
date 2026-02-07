# 투표 앱 - 서버 데이터베이스 연동 가이드

## ⚠️ 중요: Vercel에서 파일 시스템은 읽기 전용입니다

현재 코드는 파일 시스템(JSON 파일)을 사용하지만, Vercel에서는 작동하지 않습니다.
대신 **Vercel KV (Redis)** 또는 **Vercel Postgres**를 사용해야 합니다.

## 🚀 가장 쉬운 방법: Vercel KV 사용

### 1단계: Vercel KV 생성

1. Vercel Dashboard → Storage 탭
2. "Create Database" 클릭
3. "KV" 선택
4. 데이터베이스 이름 입력 (예: vote-app-db)
5. "Create" 클릭

### 2단계: 프로젝트에 연결

1. 생성된 KV 데이터베이스 선택
2. "Connect Project" 클릭
3. vote-v2 프로젝트 선택
4. 환경 변수 자동 추가됨

### 3단계: 코드 수정

`lib/server-store.ts` 파일을 다음과 같이 수정:

```typescript
import { kv } from '@vercel/kv';

export interface User {
  id: string;
  username: string;
  password: string;
  joinDate: string;
}

export interface Vote {
  id: string;
  creatorId: string;
  question: string;
  options: string[];
  hasOther: boolean;
  selectionType: 'fixed' | 'multiple';
  selectionCount?: number;
  deadline?: string;
  createdAt: string;
  responses: VoteResponse[];
}

export interface VoteResponse {
  userId: string;
  selectedOptions: number[];
  otherText?: string;
  timestamp: string;
}

export async function getUsers(): Promise<User[]> {
  const users = await kv.get<User[]>('users');
  return users || [];
}

export async function saveUsers(users: User[]): Promise<void> {
  await kv.set('users', users);
}

export async function getVotes(): Promise<Vote[]> {
  const votes = await kv.get<Vote[]>('votes');
  return votes || [];
}

export async function saveVotes(votes: Vote[]): Promise<void> {
  await kv.set('votes', votes);
}
```

### 4단계: package.json에 의존성 추가

```json
{
  "dependencies": {
    "@vercel/kv": "^1.0.1",
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.3"
  }
}
```

### 5단계: API Routes 수정

모든 API routes를 async/await로 변경:

`app/api/users/register/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getUsers, saveUsers, User } from '@/lib/server-store';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const users = await getUsers(); // async 추가
    
    if (users.some(u => u.username === username)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      joinDate: new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsers(users); // async 추가

    return NextResponse.json({ user: newUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
```

나머지 API routes도 동일하게 수정하세요.

### 6단계: 배포

```bash
git add .
git commit -m "Add Vercel KV support"
git push
```

## 💡 대안: Vercel Postgres

더 복잡한 쿼리가 필요하다면 Postgres를 사용할 수 있습니다:

1. Vercel Dashboard → Storage → Postgres
2. 데이터베이스 생성
3. `@vercel/postgres` 패키지 설치
4. SQL 쿼리로 데이터 관리

## 📝 참고

- Vercel KV는 Redis 기반으로 매우 빠름
- 무료 플랜: 256MB 스토리지, 30,000 commands/month
- 충분히 여러 사용자가 사용 가능

## 🎯 다음 단계

1. Vercel KV 설정
2. 코드 수정
3. GitHub에 푸시
4. 자동 배포 대기
5. 테스트!

모든 사용자가 같은 데이터를 공유하게 됩니다! 🚀
