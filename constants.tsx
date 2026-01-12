
import { Voice } from './types';

export const AVAILABLE_VOICES: Voice[] = [
  { 
    id: 'Kore', 
    name: 'Kore', 
    description: 'Balanced, professional, and clear. Ideal for presentations.', 
    category: 'Professional',
    previewColor: 'from-blue-500 to-cyan-400'
  },
  { 
    id: 'Puck', 
    name: 'Puck', 
    description: 'Youthful and energetic. Great for social media and ads.', 
    category: 'Conversational',
    previewColor: 'from-orange-400 to-pink-500'
  },
  { 
    id: 'Charon', 
    name: 'Charon', 
    description: 'Deep, resonant, and authoritative. Perfect for documentaries.', 
    category: 'Narrator',
    previewColor: 'from-purple-600 to-indigo-700'
  },
  { 
    id: 'Zephyr', 
    name: 'Zephyr', 
    description: 'Soft, airy, and calming. Excellent for meditation apps.', 
    category: 'Character',
    previewColor: 'from-teal-400 to-emerald-500'
  },
  { 
    id: 'Fenrir', 
    name: 'Fenrir', 
    description: 'Gritty and expressive. Good for storytelling and gaming.', 
    category: 'Character',
    previewColor: 'from-rose-500 to-orange-600'
  }
];

export const MAX_TEXT_LENGTH = 1000;
