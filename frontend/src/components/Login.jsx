import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-50 relative font-sans overflow-hidden p-4">
      
      {/* BACKGROUND DECORATIVE BLOBS */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-2">
            Nnọọ!
          </h1>
          <p className="text-slate-500 font-medium text-lg">Welcome back to Learn Igbo</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-10 rounded-[2rem] shadow-xl border border-violet-100">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {error && <p className="text-sm font-bold text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">{error}</p>}
            
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all"
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 mt-2 font-bold text-white transition-all bg-violet-600 rounded-full shadow-lg hover:bg-violet-700 hover:shadow-xl hover:-translate-y-1 disabled:bg-slate-300 disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-violet-600 font-bold hover:text-fuchsia-600 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;