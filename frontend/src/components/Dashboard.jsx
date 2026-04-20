import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Flashcard from './Flashcard';
import api from '../api';

function Dashboard() {
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); 
  
  // Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [retryCounts, setRetryCounts] = useState({});
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  
  // Card UI State
  const [isFlipped, setIsFlipped] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  
  // App, Analytics, & User State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showHardPrompt, setShowHardPrompt] = useState(false);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({ first_name: '', last_name: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, userRes] = await Promise.all([
        api.get('/users/me/stats', { headers }),
        api.get('/users/me', { headers })
      ]);
      
      setStats(statsRes.data);
      setUserProfile(userRes.data);
      setEditFormData({ first_name: userRes.data.first_name, last_name: userRes.data.last_name });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    if (!isSessionActive) {
      fetchData();
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

  const startPractice = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/cards/session', { headers: { Authorization: `Bearer ${token}` } });
      
      if (response.data.length === 0) {
        setError("You have no cards due for review right now! Check back later.");
        setIsLoading(false);
        return;
      }

      setSessionQueue(response.data);
      setRetryCounts({});
      setIsSessionActive(true);
      setIsSessionComplete(false);
      setIsFlipped(false);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout(); return;
      }
      setError("Failed to load your practice session.");
    } finally {
      setIsLoading(false);
    }
  };

  const startHardPractice = async () => {
    setIsLoading(true);
    setError('');
    setShowHardPrompt(false); 
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/cards/session/hard', { headers: { Authorization: `Bearer ${token}` } });
      
      if (response.data.length === 0) {
        setError("Great news! You don't have any struggling words saved right now.");
        setIsLoading(false);
        return;
      }

      setSessionQueue(response.data);
      setRetryCounts({});
      setIsSessionActive(true);
      setIsSessionComplete(false);
      setIsFlipped(false);
    } catch (err) {
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

  const handleProfileSave = (e) => {
    e.preventDefault();
    // We will wire this up to the backend in the next step!
    console.log("Saving new profile data:", editFormData);
    setIsEditingProfile(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-stone-50 relative font-sans overflow-hidden">
      
      {/* BACKGROUND DECORATIVE BLOBS */}
      <div className="fixed top-[-10%] left-[-5%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 pointer-events-none"></div>

      {/* HEADER NAVIGATION */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mb-8 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-violet-100">
        {/* NEW DYNAMIC WELCOME MESSAGE */}
        <h1 className="text-xl font-bold text-violet-600 ml-4 tracking-tight">
          {userProfile ? `Ndewo ${userProfile.first_name}, nnọọ na Learn Igbo!` : 'Nnọọ na Learn Igbo!'}
        </h1>
        
        <div className="flex items-center gap-2">
          {!isSessionActive && (
            <>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'dashboard' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-stone-100'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'profile' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-stone-100'}`}
              >
                Profile
              </button>
            </>
          )}
          <button onClick={handleLogout} className="px-5 py-2 ml-4 text-sm font-bold text-rose-500 transition-colors bg-white border border-rose-100 rounded-full hover:bg-rose-50 hover:border-rose-200">
            Log Out
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start w-full max-w-4xl flex-1">
        
        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && !isSessionActive && userProfile && (
          <div className="w-full max-w-2xl animate-fade-in mb-12">
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[2rem] shadow-sm border border-violet-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-violet-300 to-fuchsia-300 opacity-20"></div>
              
              {!isEditingProfile ? (
                // VIEW MODE
                <div className="text-center relative">
                  <div className="relative w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg border-4 border-white group cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                    <span className="text-4xl font-bold text-white group-hover:opacity-20 transition-opacity">
                      {userProfile.first_name?.charAt(0)}{userProfile.last_name?.charAt(0)}
                    </span>
                    <span className="absolute text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-slate-800 mb-1">{userProfile.first_name} {userProfile.last_name}</h2>
                  <p className="text-slate-500 mb-6 font-medium">{userProfile.email}</p>
                  
                  <button onClick={() => setIsEditingProfile(true)} className="mb-10 px-6 py-2 text-sm font-bold text-violet-600 bg-violet-50 rounded-full hover:bg-violet-100 transition-colors">
                    Edit Profile
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Cards Studied</p>
                      <p className="text-2xl font-black text-slate-700">{stats?.total_studied || 0}</p>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Mastery Count</p>
                      <p className="text-2xl font-black text-violet-600">{stats?.mastered_cards || 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // EDIT MODE
                <form onSubmit={handleProfileSave} className="relative bg-white p-6 rounded-2xl shadow-sm border border-violet-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Profile</h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={editFormData.first_name}
                        onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={editFormData.last_name}
                        onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-stone-100 rounded-full transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-3 font-bold text-white bg-violet-600 rounded-full hover:bg-violet-700 transition-colors shadow-md">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && !isSessionActive && !isSessionComplete && (
          <div className="w-full flex flex-col items-center animate-fade-in mb-12">
            
            {/* Culture / Info Card */}
            <div className="w-full max-w-4xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 rounded-[2rem] shadow-md text-white mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">🇳🇬</span>
                  <h2 className="text-2xl font-bold">Discover Igbo</h2>
                </div>
                <p className="text-violet-50 leading-relaxed max-w-2xl text-lg font-light">
                  The Igbo language (Asụsụ Igbo) is the principal native language of the Igbo people, spoken predominantly in southeastern Nigeria. It is a tonal language, meaning the pitch of your voice can completely change the meaning of a word!
                </p>
              </div>
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Analytics Grid */}
            {stats && (
              <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                <button 
                  onClick={() => setShowHardPrompt(true)}
                  className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-sm text-center border border-transparent hover:border-violet-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-wide group-hover:text-violet-500 transition-colors">Needs Practice</p>
                  <p className="text-4xl font-black text-slate-700 mt-2 group-hover:text-violet-600 transition-colors">{stats.due_reviews}</p>
                </button>
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-sm text-center border border-stone-100">
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-wide">Accuracy</p>
                  <p className="text-4xl font-black text-emerald-500 mt-2">{stats.accuracy_percentage}%</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-sm text-center border border-stone-100">
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-wide">Mastered</p>
                  <p className="text-4xl font-black text-fuchsia-500 mt-2">{stats.mastered_cards}</p>
                </div>
              </div>
            )}

            {/* Start Practice Section */}
            <div className="text-center bg-white/90 backdrop-blur-sm p-12 rounded-[2rem] shadow-sm border border-violet-100 w-full max-w-2xl">
              <h2 className="mb-8 text-3xl font-bold text-slate-800">Ready to learn Igbo?</h2>
              {error && <p className="mb-6 text-rose-500 font-medium">{error}</p>}
              <button 
                onClick={startPractice}
                disabled={isLoading}
                className="px-12 py-5 text-lg font-bold text-white transition-all bg-violet-600 rounded-full shadow-lg hover:bg-violet-700 hover:shadow-xl hover:-translate-y-1 disabled:bg-stone-300 disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? "Preparing Queue..." : "Start Practice Session"}
              </button>
            </div>
          </div>
        )}

        {/* SESSION COMPLETE VIEW */}
        {isSessionComplete && (
          <div className="text-center bg-white/90 backdrop-blur-sm p-16 rounded-[2rem] shadow-lg border border-emerald-100 w-full max-w-xl animate-fade-in">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="mb-4 text-4xl font-extrabold text-emerald-500">Session Complete!</h2>
            <p className="mb-10 text-lg text-slate-500 font-medium">Incredible work. You've cleared your queue for this session.</p>
            <button 
              onClick={() => setIsSessionComplete(false)}
              className="px-10 py-4 font-bold text-violet-600 transition-colors bg-violet-50 rounded-full hover:bg-violet-100"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* ACTIVE SESSION VIEW */}
        {isSessionActive && sessionQueue.length > 0 && (
          <div className="flex flex-col items-center w-full max-w-xl animate-fade-in">
            <div className="flex items-center justify-between w-full mb-8 px-4">
              <span className="font-bold text-violet-600 bg-violet-100 px-5 py-2 rounded-full text-sm tracking-wide">
                Cards remaining: {sessionQueue.length}
              </span>
              <button 
                onClick={endPracticeEarly}
                className="text-sm font-bold text-slate-400 transition-colors hover:text-rose-500"
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

            {/* RESTYLED PASTEL/GLASSMORPHIC REVIEW BUTTONS */}
            <div className={`mt-12 flex gap-4 transition-all duration-300 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <button onClick={() => handleScore(1)} className="px-8 py-4 font-bold text-rose-600 transition-all bg-rose-50 border-2 border-rose-100 rounded-2xl shadow-sm hover:bg-rose-100 hover:border-rose-200 hover:-translate-y-1">
                Didn't Know
              </button>
              <button onClick={() => handleScore(3)} className="px-8 py-4 font-bold text-amber-600 transition-all bg-amber-50 border-2 border-amber-100 rounded-2xl shadow-sm hover:bg-amber-100 hover:border-amber-200 hover:-translate-y-1">
                I Guessed
              </button>
              <button onClick={() => handleScore(5)} className="px-8 py-4 font-bold text-emerald-600 transition-all bg-emerald-50 border-2 border-emerald-100 rounded-2xl shadow-sm hover:bg-emerald-100 hover:border-emerald-200 hover:-translate-y-1">
                Easy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POP-UP MODAL FOR HARD WORDS */}
      {showHardPrompt && !isSessionActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md text-center transform transition-all">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Focus Session</h3>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium">
              Do you want to start a targeted practice session focusing solely on the words you've been struggling with?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={startHardPractice} 
                className="w-full py-4 font-bold bg-violet-600 text-white rounded-full hover:bg-violet-700 shadow-md transition-colors"
              >
                Start Focus Session
              </button>
              <button 
                onClick={() => setShowHardPrompt(false)} 
                className="w-full py-4 font-bold text-slate-500 hover:bg-stone-100 rounded-full transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      {!isSessionActive && (
        <footer className="relative z-10 w-full mt-auto pt-12 pb-6 text-center text-slate-400 text-sm font-medium">
          <p>© {new Date().getFullYear()} Learn Igbo App. Empowering language learning.</p>
        </footer>
      )}

    </div>
  );
}

export default Dashboard;