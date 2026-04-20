import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirmation
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for eye icon toggle
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Security Check: Ensure passwords match before calling the API
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/signup', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
      });
      // Automatically navigate to login after successful creation
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during signup.');
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-r from-violet-600 to-fuchsia-600 mb-2">
            Join Us!
          </h1>
          <p className="text-slate-500 font-medium text-lg">Start your Igbo learning journey</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-10 rounded-[2rem] shadow-xl border border-violet-100">
          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            {error && <p className="text-sm font-bold text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">{error}</p>}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all"
                  placeholder="First"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all"
                  placeholder="Last"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all"
                placeholder="Enter your email"
              />
            </div>
            
            {/* Password with Eye Icon */}
            <div className="relative">
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all"
                placeholder="Create a password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[46px] text-xl grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium transition-all"
                placeholder="Repeat your password"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 mt-2 font-bold text-white transition-all bg-violet-600 rounded-full shadow-lg hover:bg-violet-700 hover:shadow-xl hover:-translate-y-1 disabled:bg-slate-300 disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 font-bold hover:text-fuchsia-600 transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;