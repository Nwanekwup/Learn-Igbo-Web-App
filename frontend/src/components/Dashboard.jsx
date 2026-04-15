import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Flashcard from './Flashcard';
import api from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the initial card on component mount
  useEffect(() => {
    fetchNextCard();
  }, []);

  const fetchNextCard = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.get('/cards/next', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCurrentCard(response.data);
    } catch (err) {
      console.error("Card fetch failed:", err);
      
      // Redirect to login if the JWT is expired or invalid
      if (err.response?.status === 401) {
        handleLogout();
        return;
      }
      
      setError("Failed to load your next flashcard.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-8">
      
      <div className="w-full max-w-4xl flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-blue-600">Nnọọ! (Welcome)</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
        >
          Log Out
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        
        {/* Render loading state, error state, or the actual flashcard */}
        {isLoading ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="shadow w-80 h-96 bg-gray-200 rounded-2xl"></div>
            <p className="mt-4 text-gray-400">Loading vocabulary...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 border border-red-100 rounded bg-red-50">
            {error}
          </div>
        ) : currentCard ? (
          <Flashcard 
            igboWord={currentCard.igbo_word} 
            englishTranslation={currentCard.english_translation} 
            pronunciation={currentCard.pronunciation_guide} 
          />
        ) : (
          <div className="text-gray-500">You have no cards left to review!</div>
        )}
        
        <p className="mt-8 text-gray-500">Currently studying: Core Vocabulary</p>
      </div>

    </div>
  );
}

export default Dashboard;