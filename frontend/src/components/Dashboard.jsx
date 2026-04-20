import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Flashcard from './Flashcard';
import api from '../api';

function Dashboard() {
  const navigate = useNavigate();
  
  // Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [retryCounts, setRetryCounts] = useState({});
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  
  // Card UI State
  const [isFlipped, setIsFlipped] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  
  // App & Analytics State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  
  // New Modal State
  const [showHardPrompt, setShowHardPrompt] = useState(false);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users/me/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  useEffect(() => {
    if (!isSessionActive) {
      fetchStats();
    }
  }, [isSessionActive]);

  useEffect(() => {
    let timer;
    if (isFlipped) {
      timer = setTimeout(() => setShowButtons(true), 1000);
    } else {
      setShowButtons(false);
    }
    return () => clearTimeout(timer);
  }, [isFlipped]);

  // Standard Practice Fetcher
  const startPractice = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/cards/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const cards = response.data;
      if (cards.length === 0) {
        setError("You have no cards due for review right now! Check back later.");
        setIsLoading(false);
        return;
      }

      setSessionQueue(cards);
      setRetryCounts({});
      setIsSessionActive(true);
      setIsSessionComplete(false);
      setIsFlipped(false);
    } catch (err) {
      console.error("Session fetch failed:", err);
      if (err.response?.status === 401) {
        handleLogout();
        return;
      }
      setError("Failed to load your practice session.");
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Hard Practice Fetcher
  const startHardPractice = async () => {
    setIsLoading(true);
    setError('');
    setShowHardPrompt(false); // Close the modal
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/cards/session/hard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const cards = response.data;
      if (cards.length === 0) {
        setError("Great news! You don't have any struggling words saved right now.");
        setIsLoading(false);
        return;
      }

      setSessionQueue(cards);
      setRetryCounts({});
      setIsSessionActive(true);
      setIsSessionComplete(false);
      setIsFlipped(false);
    } catch (err) {
      console.error("Hard session fetch failed:", err);
      setError("Failed to load your focus session.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScore = async (score) => {
    const currentCard = sessionQueue[0];
    const token = localStorage.getItem('token');

    try {
      await api.post(`/cards/${currentCard.id}/review`, 
        { confidence_score: score }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save score:", err);
    }

    let newQueue = [...sessionQueue];
    
    if (score === 1) { 
      const tries = retryCounts[currentCard.id] || 0;
      if (tries < 2) {
        setRetryCounts({ ...retryCounts, [currentCard.id]: tries + 1 });
        newQueue.push(currentCard);
      }
    }

    newQueue.shift();

    if (newQueue.length > 0) {
      setSessionQueue(newQueue);
      setIsFlipped(false); 
    } else {
      setIsSessionComplete(true);
      setIsSessionActive(false);
    }
  };

  const endPracticeEarly = () => {
    setIsSessionActive(false);
    setSessionQueue([]);
    setIsFlipped(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50 relative">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between w-full max-w-4xl mb-12">
        <h1 className="text-3xl font-bold text-blue-600">Nnọọ! (Welcome)</h1>
        <button onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 transition-colors border border-red-200 rounded hover:bg-red-50">
          Log Out
        </button>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-4xl flex-1">
        
        {/* DASHBOARD & ANALYTICS VIEW */}
        {!isSessionActive && !isSessionComplete && (
          <div className="w-full flex flex-col items-center">
            
            {/* Analytics Grid (Dictionary Removed, Needs Practice is a Button) */}
            {stats && (
              <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                <button 
                  onClick={() => setShowHardPrompt(true)}
                  className="bg-white p-6 rounded-2xl shadow-sm text-center border border-transparent hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center"
                >
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Needs Practice</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.due_reviews}</p>
                </button>
                <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Accuracy</p>
                  <p className="text-3xl font-bold text-green-500 mt-2">{stats.accuracy_percentage}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Mastered</p>
                  <p className="text-3xl font-bold text-purple-500 mt-2">{stats.mastered_cards}</p>
                </div>
              </div>
            )}

            {/* Start Practice Section */}
            <div className="text-center bg-white p-10 rounded-3xl shadow-lg border border-blue-50 w-full max-w-xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-800">Ready to study?</h2>
              {error && <p className="mb-4 text-red-500">{error}</p>}
              <button 
                onClick={startPractice}
                disabled={isLoading}
                className="px-10 py-4 text-lg font-bold text-white transition-all bg-blue-600 rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 disabled:bg-gray-400 disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? "Loading Queue..." : "Start Practice Session"}
              </button>
            </div>
          </div>
        )}

        {/* SESSION COMPLETE VIEW */}
        {isSessionComplete && (
          <div className="text-center bg-white p-12 rounded-3xl shadow-lg border border-green-50 w-full max-w-xl">
            <h2 className="mb-4 text-4xl font-bold text-green-600">Session Complete! 🎉</h2>
            <p className="mb-8 text-lg text-gray-600">Great job. You've reviewed all your cards for this session.</p>
            <button 
              onClick={() => setIsSessionComplete(false)}
              className="px-8 py-3 font-bold text-blue-600 transition-colors bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* ACTIVE SESSION VIEW */}
        {isSessionActive && sessionQueue.length > 0 && (
          <div className="flex flex-col items-center w-full max-w-xl">
            <div className="flex items-center justify-between w-full mb-8 px-4">
              <span className="font-semibold text-blue-500 bg-blue-50 px-4 py-1 rounded-full">
                Cards remaining: {sessionQueue.length}
              </span>
              <button 
                onClick={endPracticeEarly}
                className="text-sm font-semibold text-gray-400 transition-colors hover:text-red-500"
              >
                End Practice
              </button>
            </div>

            <Flashcard 
              key={sessionQueue[0].id}
              igboWord={sessionQueue[0].igbo_word} 
              englishTranslation={sessionQueue[0].english_translation} 
              pronunciation={sessionQueue[0].pronunciation_guide} 
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
            />

            {/* SPACED REPETITION BUTTONS */}
            <div className={`mt-10 flex gap-4 transition-all duration-300 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <button onClick={() => handleScore(1)} className="px-8 py-4 font-bold text-white transition-all bg-red-500 rounded-xl shadow-sm hover:bg-red-600 hover:shadow">
                Didn't Know
              </button>
              <button onClick={() => handleScore(3)} className="px-8 py-4 font-bold text-white transition-all bg-yellow-500 rounded-xl shadow-sm hover:bg-yellow-600 hover:shadow">
                I Guessed
              </button>
              <button onClick={() => handleScore(5)} className="px-8 py-4 font-bold text-white transition-all bg-green-500 rounded-xl shadow-sm hover:bg-green-600 hover:shadow">
                Easy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POP-UP MODAL FOR HARD WORDS */}
      {showHardPrompt && !isSessionActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md text-center transform transition-all">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Focus Session</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Do you want to start a targeted practice session using only the words you have been struggling with?
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowHardPrompt(false)} 
                className="px-6 py-3 font-semibold text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={startHardPractice} 
                className="px-6 py-3 font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-colors"
              >
                Start Focus Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;