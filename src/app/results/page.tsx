'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { logger } from '@/utils/logger';

interface VoteData {
  votes: { [key: string]: number };
}

interface Registration {
  timestamp: string;
  fullName: string;
  department: string;
  activity: string;
  imageUrl: string;
}

interface ApiError {
  error: string;
  code?: string;
}

// Sample data - replace with your actual voting options
const voteOptions = [
  {
    id: 1,
    imageUrl: '/images/option1.jpg',
    title: 'ค้นป่าหาสัตว์',
  },
  {
    id: 2,
    imageUrl: '/images/option2.jpg',
    title: 'กู่ร้องให้ก้องไพร',
  },
  {
    id: 3,
    imageUrl: '/images/option3.jpg',
    title: 'โหยหวนชวนโดนถีบ',
  },
];

const handleApiError = async (response: Response): Promise<ApiError> => {
  try {
    const data = await response.json();
    return { error: data.error || 'An unexpected error occurred', code: data.code };
  } catch {
    return { error: `HTTP error ${response.status}`, code: response.status.toString() };
  }
};

export default function ResultsPage() {
  const [voteData, setVoteData] = useState<VoteData>({ votes: {} });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [votesResponse, registrationsResponse] = await Promise.all([
          fetch('/api/votes'),
          fetch('/api/registrations')
        ]);

        if (!votesResponse.ok) {
          const errorData = await handleApiError(votesResponse);
          logger.error('Failed to fetch votes', { 
            context: 'Results page',
            error: errorData 
          });
          throw new Error(errorData.error);
        }

        if (!registrationsResponse.ok) {
          const errorData = await handleApiError(registrationsResponse);
          logger.error('Failed to fetch registrations', { 
            context: 'Results page',
            error: errorData 
          });
          throw new Error(errorData.error);
        }

        const [votesData, registrationsData] = await Promise.all([
          votesResponse.json(),
          registrationsResponse.json()
        ]);

        setVoteData(votesData);
        setRegistrations(registrationsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
        logger.error(err, { context: 'Results page data fetch' });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate votes for each option
  const getVotesForOption = (optionTitle: string) => {
    return Object.entries(voteData.votes)
      .filter(([key]) => key.includes(`-${optionTitle}`))
      .reduce((sum, [, count]) => sum + count, 0);
  };

  // Get vote count for a specific contestant
  const getContestantVotes = (fullName: string, activity: string) => {
    const key = `${fullName}-${activity}`;
    return voteData.votes[key] || 0;
  };

  const totalVotes = Object.values(voteData.votes).reduce((sum, count) => sum + count, 0);

  // Get contestants for a specific option
  const getContestantsForOption = (optionTitle: string) => {
    return registrations
      .filter(reg => reg.activity === optionTitle)
      .sort((a, b) => {
        const votesA = getContestantVotes(a.fullName, a.activity);
        const votesB = getContestantVotes(b.fullName, b.activity);
        return votesB - votesA; // Sort by votes in descending order
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Voting Results</h1>
      
      <div className="space-y-8">
        {voteOptions.map((option) => {
          const optionVotes = getVotesForOption(option.title);
          const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
          const contestants = getContestantsForOption(option.title);

          return (
            <div key={option.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Option Header */}
              <div className="p-6 bg-gray-50 border-b">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative h-40 w-full md:w-64 flex-shrink-0">
                    <Image
                      src={option.imageUrl}
                      alt={option.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold mb-4">{option.title}</h2>
                    <div className="space-y-2">
                      <p className="text-lg text-blue-600 font-medium">
                        Total Votes: {optionVotes}
                      </p>
                      <p className="text-gray-600">
                        Percentage: {percentage.toFixed(1)}%
                      </p>
                      <p className="text-gray-600">
                        Number of Contestants: {contestants.length}
                      </p>
                      {/* Vote Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contestants List */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contestants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contestants.map((contestant, index) => {
                    const contestantVotes = getContestantVotes(contestant.fullName, contestant.activity);
                    const contestantPercentage = optionVotes > 0 
                      ? (contestantVotes / optionVotes) * 100 
                      : 0;

                    return (
                      <div 
                        key={`${contestant.fullName}-${index}`}
                        className="bg-gray-50 rounded-lg p-4 relative"
                      >
                        <div className="relative h-48 w-full mb-4">
                          {contestant.imageUrl ? (
                            <Image
                              src={contestant.imageUrl}
                              alt={`Photo of ${contestant.fullName}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold mb-2">{contestant.fullName}</h4>
                        <p className="text-gray-600 text-sm mb-1">
                          Department: {contestant.department}
                        </p>
                        <div className="mt-2">
                          <p className="text-blue-600 font-medium">
                            Votes: {contestantVotes}
                          </p>
                          <p className="text-gray-500 text-sm">
                            ({contestantPercentage.toFixed(1)}% of option votes)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
} 