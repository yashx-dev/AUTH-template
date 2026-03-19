import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClass = (path) => {
    return `px-3 py-2 rounded-md text-sm font-medium ${
      isActive(path)
        ? 'bg-indigo-700 text-white'
        : 'text-white hover:bg-indigo-700'
    }`;
  };

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              AuthApp
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={getLinkClass('/dashboard')}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={getLinkClass('/profile')}
                >
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
              <>
                <Link 
                  to="/login" 
                  className={getLinkClass('/login')}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={getLinkClass('/register')}
                >
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