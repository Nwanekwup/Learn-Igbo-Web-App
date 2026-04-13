import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the saved token and send the user back to login
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="p-8 bg-white rounded shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Nnọọ! (Welcome!)</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Ready to learn Igbo?
        </p>
        
        <div className="p-6 bg-blue-50 rounded border border-blue-100 mb-8">
          <p className="text-gray-700">
            Main dashboard
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="px-6 py-2 text-white bg-red-500 rounded hover:bg-red-600 font-semibold transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;