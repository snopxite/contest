import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Read the IP votes file
    const ipVotesPath = path.join(process.cwd(), 'data', 'ip-votes.json');
    let ipVotes: { [key: string]: boolean } = {};
    
    try {
      const fileContent = await fs.readFile(ipVotesPath, 'utf-8');
      ipVotes = JSON.parse(fileContent);
    } catch (error) {
      // If file doesn't exist, create it
      await fs.writeFile(ipVotesPath, JSON.stringify({}));
    }

    return NextResponse.json({ hasVoted: !!ipVotes[ip] });
  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 });
  }
} 