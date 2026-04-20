import { useState } from 'react';

function Flashcard({ igboWord, englishTranslation, pronunciation, isFlipped, onFlip }) {
  
  const playAudio = (e) => {
    e.stopPropagation(); 
    const audio = new Audio(pronunciation);
    audio.play();
  };

  return (
    <div 
      className="w-80 min-h-[24rem] h-auto cursor-pointer group"
      style={{ perspective: '1000px' }} 
      onClick={onFlip}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-700 shadow-xl rounded-[2rem] [transform-style:preserve-3d] grid ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        
        {/* FRONT OF CARD */}
        <div className="col-start-1 row-start-1 flex flex-col items-center justify-center p-8 text-center bg-white border-2 border-violet-100 rounded-[2rem] [backface-visibility:hidden]">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">{igboWord}</h2>
          <p className="mt-8 text-sm font-medium text-violet-300 animate-pulse">Click to flip</p>
        </div>

        {/* BACK OF CARD */}
        <div className="col-start-1 row-start-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[2rem] shadow-inner [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <h2 className="text-3xl font-bold text-white mb-8">{englishTranslation}</h2>
          
          {/* Smart Pronunciation Renderer */}
          {pronunciation && (
            pronunciation.startsWith('http') ? (
              <button 
                onClick={playAudio}
                className="px-6 py-3 font-bold text-violet-600 transition-colors bg-white rounded-full hover:bg-violet-50 shadow-sm"
              >
                🔊 Play Audio
              </button>
            ) : (
              <p className="text-xl italic font-medium text-violet-100">"{pronunciation}"</p>
            )
          )}
          
        </div>
      </div>
    </div>
  );
}

export default Flashcard;