
import React from 'react';
import { Voice } from '../types';

interface VoiceCardProps {
  voice: Voice;
  isSelected: boolean;
  onSelect: (voice: Voice) => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ voice, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(voice)}
      className={`relative flex flex-col items-start p-4 rounded-xl transition-all duration-300 text-left w-full group ${
        isSelected 
          ? 'bg-white/10 ring-2 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${voice.previewColor} mb-3 flex items-center justify-center text-white shadow-lg`}>
        <span className="text-lg font-bold">{voice.name[0]}</span>
      </div>
      <h3 className="text-white font-semibold text-sm mb-1">{voice.name}</h3>
      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{voice.description}</p>
      <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-medium">
        {voice.category}
      </span>
      
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
        </div>
      )}
    </button>
  );
};

export default VoiceCard;
