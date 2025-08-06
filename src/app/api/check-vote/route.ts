import { NextResponse } from 'next/server';
import path from 'path';
import {
  DATA_DIR,
  ensureDataDirectory,
  readJsonFile,
} from '@/utils/fs';

const IP_VOTES_FILE = path.join(DATA_DIR, 'ip-votes.json');

interface IpVotes {
  [key: string]: boolean;
}

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    await ensureDataDirectory();
    const ipVotes = await readJsonFile<IpVotes>(IP_VOTES_FILE, {});

    return NextResponse.json({ hasVoted: !!ipVotes[ip] });
  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { error: 'Failed to check vote status' },
      { status: 500 }
    );
  }
} 