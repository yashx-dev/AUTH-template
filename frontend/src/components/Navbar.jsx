import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              AuthApp
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Auth Navigation
              <>
                <Link to="/dashboard" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md">
                  Profile
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-indigo-400">
                  <span className="text-white text-sm">
                    Hi, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-700 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-800"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // Public Navigation
              <>
                <Link to="/login" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-700 text-white px-3 py-2 rounded-md hover:bg-indigo-800">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;