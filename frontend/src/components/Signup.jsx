import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Track password requirements status
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

  // Run validation checks every time the password changes
  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation before hitting the API
    const allValid = Object.values(validations).every(Boolean);
    if (!allValid) {
      setError("Please meet all password requirements before signing up.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post('/signup', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
      });

      navigate('/login');
    } catch (err) {
      // If the backend returns a 422 or 400, display the specific error message
      const backendMessage = err.response?.data?.detail;
      
      if (Array.isArray(backendMessage)) {
        // FastAPI usually sends an array for 422 validation errors
        setError(backendMessage[0].msg);
      } else if (typeof backendMessage === 'string') {
        // For standard 400 errors like "Email already registered"
        setError(backendMessage);
      } else {
        setError("Failed to create account. Please try again.");
      }
    }
  };

  // Helper component to render the requirement list items
  const Requirement = ({ met, label }) => (
    <div className={`flex items-center text-xs mt-1 ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <span className="mr-2">{met ? '✓' : '○'}</span>
      {label}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-blue-600">Create an Account</h2>
        
        {error && (
          <div className="mb-4 text-sm text-center text-red-500 bg-red-100 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="First Name"
              className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            className="p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none pr-16"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm text-gray-500 hover:text-blue-600 px-2 py-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password Requirements Checklist */}
          <div className="bg-gray-50 p-3 rounded border border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-1">Password Requirements:</p>
            <Requirement met={validations.length} label="At least 8 characters" />
            <Requirement met={validations.uppercase} label="One uppercase letter" />
            <Requirement met={validations.number} label="One number" />
            <Requirement met={validations.symbol} label="One special character (!@#$%^&*)" />
          </div>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="p-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors font-semibold">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;