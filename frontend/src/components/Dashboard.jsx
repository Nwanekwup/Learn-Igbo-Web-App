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
  
  // App State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. The 1-Second Button Delay Logic
  useEffect(() => {
    let timer;
    if (isFlipped) {
      timer = setTimeout(() => setShowButtons(true), 1000);
    } else {
      setShowButtons(false);
    }
    return () => clearTimeout(timer);
  }, [isFlipped]);

  // 2. Start the Session
  const startPractice = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // We will create this new endpoint in the backend next!
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

  // 3. Handle the User's Score
  const handleScore = async (score) => {
    const currentCard = sessionQueue[0];
    const token = localStorage.getItem('token');

    // A. Send score to backend instantly 
    try {
      await api.post(`/cards/${currentCard.id}/review`, 
        { confidence_score: score }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save score:", err);
    }

    // B. Queue Logic (The 2-Try Limit)
    let newQueue = [...sessionQueue];
    
    if (score === 1) { // Didn't Know
      const tries = retryCounts[currentCard.id] || 0;
      if (tries < 2) {
        // They get another try! Push it to the back of the line
        setRetryCounts({ ...retryCounts, [currentCard.id]: tries + 1 });
        newQueue.push(currentCard);
      }
    }

    // C. Remove the card we just answered from the front
    newQueue.shift();

    // D. Move to next card or end session
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
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
      <div className="flex items-center justify-between w-full max-w-4xl mb-12">
        <h1 className="text-3xl font-bold text-blue-600">Nnọọ! (Welcome)</h1>
        <button onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 transition-colors border border-red-200 rounded hover:bg-red-50">
          Log Out
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-xl">
        
        {/* DASHBOARD VIEW */}
        {!isSessionActive && !isSessionComplete && (
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">Ready to study?</h2>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <button 
              onClick={startPractice}
              disabled={isLoading}
              className="px-8 py-4 text-lg font-bold text-white transition-colors bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? "Loading..." : "Start Practice Session"}
            </button>
          </div>
        )}

        {/* SESSION COMPLETE VIEW */}
        {isSessionComplete && (
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-green-600">Session Complete! 🎉</h2>
            <p className="mb-8 text-gray-600">Great job. You've reviewed all your cards for this session.</p>
            <button 
              onClick={() => setIsSessionComplete(false)}
              className="px-6 py-3 font-semibold text-blue-600 transition-colors bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* ACTIVE SESSION VIEW */}
        {isSessionActive && sessionQueue.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center justify-between w-full mb-6 px-4">
              <span className="font-medium text-gray-500">
                Cards remaining: {sessionQueue.length}
              </span>
              <button 
                onClick={endPracticeEarly}
                className="text-sm font-medium text-gray-400 transition-colors hover:text-red-500"
              >
                End Practice
              </button>
            </div>

            <Flashcard 
              igboWord={sessionQueue[0].igbo_word} 
              englishTranslation={sessionQueue[0].english_translation} 
              pronunciation={sessionQueue[0].pronunciation_guide} 
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
            />

            {/* SPACED REPETITION BUTTONS */}
            <div className={`mt-8 flex gap-4 transition-opacity duration-300 ${showButtons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button onClick={() => handleScore(1)} className="px-6 py-3 font-semibold text-white transition-colors bg-red-500 rounded-lg shadow hover:bg-red-600">
                Didn't Know
              </button>
              <button onClick={() => handleScore(3)} className="px-6 py-3 font-semibold text-white transition-colors bg-yellow-500 rounded-lg shadow hover:bg-yellow-600">
                I Guessed
              </button>
              <button onClick={() => handleScore(5)} className="px-6 py-3 font-semibold text-white transition-colors bg-green-500 rounded-lg shadow hover:bg-green-600">
                Easy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;