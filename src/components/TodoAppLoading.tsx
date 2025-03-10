export function TodoAppLoading() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
