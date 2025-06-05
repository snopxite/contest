import Link from 'next/link';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to the Voting System</h1>
        <p className="text-xl text-gray-600 mb-8">
          Make your voice heard! Participate in our voting system and choose your favorite options.
        </p>
        <Link
          href="/vote"
          className="inline-block bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors"
        >
          Start Voting Now
        </Link>
      </div>
    </main>
  );
}
