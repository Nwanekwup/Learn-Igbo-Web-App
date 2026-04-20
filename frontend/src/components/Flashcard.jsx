import { useState } from 'react';

function Flashcard({ igboWord, englishTranslation, pronunciation, isFlipped, onFlip }) {
  
  /**
   * Prevents the click event from bubbling up to the parent container,
   * ensuring the card does not flip when the user only intends to play audio.
   */
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
        className={`relative w-full h-full transition-transform duration-700 shadow-xl rounded-2xl [transform-style:preserve-3d] grid ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        
        {/* FRONT OF CARD */}
        <div className="col-start-1 row-start-1 flex flex-col items-center justify-center p-8 text-center bg-white border-2 border-blue-100 rounded-2xl [backface-visibility:hidden]">
          <h2 className="text-5xl font-bold text-blue-700">{igboWord}</h2>
          <p className="mt-8 text-sm text-gray-400 animate-pulse">Click to flip</p>
        </div>

        {/* BACK OF CARD */}
        <div className="col-start-1 row-start-1 flex flex-col items-center justify-center p-8 text-center bg-blue-600 rounded-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <h2 className="text-3xl font-bold text-white mb-8">{englishTranslation}</h2>
          
          {/* Smart Pronunciation Renderer */}
          {pronunciation && (
            pronunciation.startsWith('http') ? (
              <button 
                onClick={playAudio}
                className="px-6 py-2 font-semibold text-blue-600 transition-colors bg-white rounded-full hover:bg-blue-50"
              >
                🔊 Play Audio
              </button>
            ) : (
              <p className="text-xl italic font-light text-blue-200">"{pronunciation}"</p>
            )
          )}
          
        </div>
      </div>
    </div>
  );
}

export default Flashcard;