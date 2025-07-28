export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-papaya_whip-500">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-prussian_blue-400">404</h1>
        <h2 className="text-2xl font-semibold mt-4 text-prussian_blue-500">Page Not Found</h2>
        <p className="text-prussian_blue-400 mt-2">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="inline-block mt-6 px-4 py-2 bg-fire_brick-500 text-papaya_whip-500 rounded-md hover:bg-fire_brick-600 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
