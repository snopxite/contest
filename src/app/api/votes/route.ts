import { NextResponse } from 'next/server';
import path from 'path';
import { logger } from '@/utils/logger';
import {
  DATA_DIR,
  ensureDataDirectory,
  readJsonFile,
  writeJsonFile,
} from '@/utils/fs';

const VOTES_FILE = path.join(DATA_DIR, 'votes.json');
const IP_VOTES_FILE = path.join(DATA_DIR, 'ip-votes.json');

interface VoteData {
  votes: { [key: string]: number };
}

interface IpVotes {
  [key: string]: boolean;
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