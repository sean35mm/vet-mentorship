export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            MVT - Veteran Mentorship Platform
          </h1>
          <p className="text-xl text-secondary-700 mb-8">
            Connecting military veterans for peer-to-peer mentorship
          </p>
          <div className="bg-white rounded-lg shadow-soft p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-primary-800 mb-4">
              🚀 Phase 1 Complete!
            </h2>
            <div className="text-left space-y-2">
              <p className="flex items-center text-success-600">
                <span className="mr-2">✅</span>
                Project foundation and configuration
              </p>
              <p className="flex items-center text-success-600">
                <span className="mr-2">✅</span>
                Next.js 15 with App Router
              </p>
              <p className="flex items-center text-success-600">
                <span className="mr-2">✅</span>
                Convex backend setup
              </p>
              <p className="flex items-center text-success-600">
                <span className="mr-2">✅</span>
                TypeScript configuration
              </p>
              <p className="flex items-center text-success-600">
                <span className="mr-2">✅</span>
                Tailwind CSS v4 styling
              </p>
              <p className="flex items-center text-success-600">
                <span className="mr-2">✅</span>
                Database schema defined
              </p>
            </div>
            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <p className="text-primary-800 font-medium">
                Ready for Phase 2: Database Schema & Convex Functions
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}