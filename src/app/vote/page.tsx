'use client';

import { useState } from 'react';
import VoteCard from '@/components/VoteCard';
import RegistrationList from '@/components/RegistrationList';
import Link from 'next/link';

// Sample data - replace with your actual voting options
const initialVoteOptions = [
  {
    id: 1,
    imageUrl: '/images/option1.jpg',
    title: 'Option 1',
    votes: 0,
  },
  {
    id: 2,
    imageUrl: '/images/option2.jpg',
    title: 'Option 2',
    votes: 0,
  },
  {
    id: 3,
    imageUrl: '/images/option3.jpg',
    title: 'Option 3',
    votes: 0,
  },
];

export default function VotePage() {
  const [voteOptions, setVoteOptions] = useState(initialVoteOptions);
  const [hasVoted, setHasVoted] = useState(false);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleVote = (id: number) => {
    if (!hasVoted) {
      setVoteOptions(
        voteOptions.map((option) =>
          option.id === id
            ? { ...option, votes: option.votes + 1 }
            : option
        )
      );
      setHasVoted(true);
      
      // Here you would typically make an API call to save the vote
      // saveVote(id);
    }
  };

  const handleOptionClick = (option: typeof initialVoteOptions[0]) => {
    setSelectedOption(option.title);
    setShowRegistrations(true);
  };

  const handleBackToOptions = () => {
    setSelectedOption(null);
    setShowRegistrations(false);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cast Your Vote</h1>
        {showRegistrations && (
          <button
            onClick={handleBackToOptions}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Back to Options
          </button>
        )}
        <Link href="/results" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          View Results
        </Link>
      </div>

      {showRegistrations ? (
        <>
          {selectedOption && (
            <h2 className="text-xl font-semibold mb-4">
              Registrations for {selectedOption}
            </h2>
          )}
          <RegistrationList selectedActivity={selectedOption} />
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voteOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="cursor-pointer"
            >
              <VoteCard
                option={option}
                onVote={handleVote}
                hasVoted={hasVoted}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 