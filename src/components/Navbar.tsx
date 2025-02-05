import { Link, useLocation } from 'react-router-dom';
import { Brain, Scale, History, Home } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-primary/50 backdrop-blur-sm shadow-md">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2">
       <img src="/logo.png" alt="What If Logo" className="w-20 h-18" /> 
     </Link>

          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                location.pathname === '/' ? 'text-accent' : 'text-accent/60 hover:text-accent'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/new-decision"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                location.pathname === '/new-decision' ? 'text-accent' : 'text-accent/60 hover:text-accent'
              }`}
            >
              <Brain className="w-5 h-5" />
              <span>New Decision</span>
            </Link>
            <Link
              to="/what-if"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                location.pathname === '/what-if' ? 'text-accent' : 'text-accent/60 hover:text-accent'
              }`}
            >
              <Scale className="w-5 h-5" />
              <span>What-If</span>
            </Link>
            <Link
              to="/history"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                location.pathname === '/history' ? 'text-accent' : 'text-accent/60 hover:text-accent'
              }`}
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}