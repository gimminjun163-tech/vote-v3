import fs from 'fs';
import path from 'path';

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

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');

// 데이터 디렉토리 및 파일 초기화
function initializeFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(VOTES_FILE)) {
    fs.writeFileSync(VOTES_FILE, JSON.stringify([]));
  }
}

export function getUsers(): User[] {
  initializeFiles();
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function saveUsers(users: User[]): void {
  initializeFiles();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function getVotes(): Vote[] {
  initializeFiles();
  const data = fs.readFileSync(VOTES_FILE, 'utf-8');
  return JSON.parse(data);
}

export function saveVotes(votes: Vote[]): void {
  initializeFiles();
  fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2));
}
