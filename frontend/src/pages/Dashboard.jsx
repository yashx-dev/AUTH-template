import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePageTitle } from '../hooks/usePageTitle';

const Dashboard = () => {
  usePageTitle('Dashboard');
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">
              This is your protected dashboard. You're successfully logged in.
            </p>
            <div className="mt-6 bg-indigo-50 border-l-4 border-indigo-400 p-4">
              <p className="text-sm text-indigo-700">
                <strong>Email:</strong> {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;