import { useState } from 'react';

function Flashcard({ igboWord, englishTranslation, pronunciation }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-80 h-96 cursor-pointer group"
      style={{ perspective: '1000px' }} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-700 shadow-xl rounded-2xl [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        
        {/* FRONT OF CARD (Igbo Word) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white border-2 border-blue-100 rounded-2xl [backface-visibility:hidden]">
          <h2 className="text-5xl font-bold text-blue-700">{igboWord}</h2>
          <p className="absolute bottom-6 text-sm text-gray-400 animate-pulse">Click to flip</p>
        </div>

        {/* BACK OF CARD (English & Pronunciation) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-blue-600 rounded-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <h2 className="text-4xl font-bold text-white mb-2">{englishTranslation}</h2>
          
          {/* Only show pronunciation if it exists */}
          {pronunciation && (
            <p className="text-xl text-blue-200 italic font-light">"{pronunciation}"</p>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default Flashcard;