'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-papaya_whip-500">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-prussian_blue-400">500</h1>
        <h2 className="text-2xl font-semibold mt-4 text-prussian_blue-500">Something went wrong!</h2>
        <p className="text-prussian_blue-400 mt-2">
          An error occurred while processing your request.
        </p>
        <button
          onClick={reset}
          className="inline-block mt-6 px-4 py-2 bg-fire_brick-500 text-papaya_whip-500 rounded-md hover:bg-fire_brick-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
