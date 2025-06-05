import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

const DATA_DIR = path.join(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');
const IP_VOTES_FILE = path.join(DATA_DIR, 'ip-votes.json');

interface VoteData {
  votes: { [key: string]: number };
}

interface IpVotes {
  [key: string]: boolean;
}

async function ensureDataDirectory() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await fs.access(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify(defaultValue));
      return defaultValue;
    }
    throw error;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    await ensureDataDirectory();
    const votes = await readJsonFile<VoteData>(VOTES_FILE, { votes: {} });
    return NextResponse.json(votes);
  } catch (error) {
    logger.error('Failed to read votes', { context: 'Votes API', error });
    return NextResponse.json(
      { error: 'Failed to read votes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { contestant } = await request.json();

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant is required' },
        { status: 400 }
      );
    }

    await ensureDataDirectory();

    // Check if IP has already voted
    const ipVotes = await readJsonFile<IpVotes>(IP_VOTES_FILE, {});
    if (ipVotes[ip]) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 403 }
      );
    }

    // Record the vote
    const voteData = await readJsonFile<VoteData>(VOTES_FILE, { votes: {} });
    voteData.votes[contestant] = (voteData.votes[contestant] || 0) + 1;
    await writeJsonFile(VOTES_FILE, voteData);

    // Record IP vote
    ipVotes[ip] = true;
    await writeJsonFile(IP_VOTES_FILE, ipVotes);

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    logger.error('Failed to record vote', { context: 'Votes API', error });
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
} 