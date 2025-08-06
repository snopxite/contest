'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { logger } from '@/utils/logger';

interface Registration {
  timestamp: string;
  fullName: string;
  department: string;
  activity: string;
  imageUrl: string;
}

interface VoteCheckResponse {
  hasVoted: boolean;
  error?: string;
}

interface VoteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface ApiError {
  error: string;
  code?: string;
}

interface RegistrationListProps {
  selectedActivity: string | null;
  showVoteButtons?: boolean;
}

const handleApiError = async (response: Response): Promise<ApiError> => {
  try {
    const data = await response.json();
    return { error: data.error || 'An unexpected error occurred', code: data.code };
  } catch {
    return { error: `HTTP error ${response.status}`, code: response.status.toString() };
  }
};

export default function RegistrationList({ selectedActivity, showVoteButtons = true }: RegistrationListProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const registrationsResponse = await fetch('/api/registrations');

        if (!registrationsResponse.ok) {
          const errorData = await handleApiError(registrationsResponse);
          logger.error('Failed to fetch registrations', { 
            context: 'Registration list',
            error: errorData 
          });
          throw new Error(errorData.error);
        }

        const registrationsData = await registrationsResponse.json();
        setRegistrations(registrationsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        logger.error(err, { context: 'Registration list' });
        setError(errorMessage);
        toast.error(`Failed to load registrations: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const response = await fetch('/api/check-vote');
        const data: VoteCheckResponse = await response.json();
        
        if (response.ok && typeof data.hasVoted === 'boolean') {
          setHasVoted(data.hasVoted);
        } else {
          const errorData = await handleApiError(response);
          logger.error('Failed to check vote status', { 
            context: 'Vote check',
            error: errorData 
          });
        }
      } catch (err) {
        logger.error('Error checking vote status', { 
          context: 'Vote check',
          error: err 
        });
      }
    };

    checkVoteStatus();
  }, []);

  const handleVote = async (contestant: string) => {
    if (hasVoted) {
      toast.error('You have already voted!');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contestant }),
      });

      const data: VoteResponse = await response.json();

      if (response.ok && data.success) {
        setHasVoted(true);
        toast.success(data.message || 'Vote recorded successfully!');
      } else {
        const errorData = await handleApiError(response);
        logger.error('Failed to submit vote', { 
          context: 'Vote submission',
          error: errorData 
        });
        throw new Error(errorData.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit vote';
      logger.error('Vote submission error', { 
        context: 'Vote submission',
        error: err 
      });
      toast.error(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredRegistrations = selectedActivity
    ? registrations.filter(reg => reg.activity === selectedActivity)
    : registrations;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRegistrations.map((registration, index) => (
        <div
          key={`${registration.fullName}-${index}`}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="relative h-48">
            {registration.imageUrl ? (
              <Image
                src={registration.imageUrl}
                alt={`Photo of ${registration.fullName}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{registration.fullName}</h3>
            <p className="text-gray-600 mb-1">Department: {registration.department}</p>
            <p className="text-gray-600 mb-4">Activity: {registration.activity}</p>
            
            {showVoteButtons && (
              <button
                onClick={() => handleVote(`${registration.fullName}-${registration.activity}`)}
                disabled={hasVoted || isVoting}
                className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                  hasVoted || isVoting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isVoting ? 'Voting...' : hasVoted ? 'Already Voted' : 'Vote'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 