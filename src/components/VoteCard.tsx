'use client';

import Image from 'next/image';

interface VoteOption {
  id: number;
  imageUrl: string;
  title: string;
  votes: number;
}

interface VoteCardProps {
  option: VoteOption;
  onVote: (id: number) => void;
  hasVoted: boolean;
}

export default function VoteCard({ option, onVote, hasVoted }: VoteCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-64 w-full">
        <Image
          src={option.imageUrl}
          alt={option.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Votes: {option.votes}</span>
          <button
            onClick={() => onVote(option.id)}
            disabled={hasVoted}
            className={`px-4 py-2 rounded-full ${
              hasVoted
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors`}
          >
            {hasVoted ? 'Voted' : 'Vote'}
          </button>
        </div>
      </div>
    </div>
  );
} 