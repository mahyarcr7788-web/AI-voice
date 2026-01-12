
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic2, 
  Play, 
  Square, 
  Download, 
  Trash2, 
  History, 
  Volume2, 
  Settings2, 
  Sparkles,
  AlertCircle,
  Loader2,
  Share2
} from 'lucide-react';
import { AVAILABLE_VOICES, MAX_TEXT_LENGTH } from './constants';
import { Voice, GeneratedSpeech, AppStatus } from './types';
import VoiceCard from './components/VoiceCard';
import AudioVisualizer from './components/AudioVisualizer';
import { generateSpeech } from './services/geminiService';
import { decodeBase64, decodeAudioData, audioBufferToWav } from './services/audioService';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(AVAILABLE_VOICES[0]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<GeneratedSpeech[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setErrorMessage(null);
    setStatus(AppStatus.GENERATING);

    try {
      initAudio();
      const base64 = await generateSpeech(text, selectedVoice.id);
      const binaryData = decodeBase64(base64);
      const buffer = await decodeAudioData(binaryData, audioContextRef.current!);

      const newSpeech: GeneratedSpeech = {
        id: crypto.randomUUID(),
        text: text,
        voiceId: selectedVoice.id,
        timestamp: Date.now(),
        audioBuffer: buffer,
        duration: buffer.duration
      };

      setHistory(prev => [newSpeech, ...prev]);
      setStatus(AppStatus.IDLE);
      playSpeech(newSpeech);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate speech. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  };

  const playSpeech = (speech: GeneratedSpeech) => {
    if (!audioContextRef.current || !analyserRef.current || !speech.audioBuffer) return;

    // Stop existing playback
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = speech.audioBuffer;
    source.connect(analyserRef.current);
    
    source.onended = () => {
      setStatus(AppStatus.IDLE);
    };

    setStatus(AppStatus.PLAYING);
    source.start(0);
    currentSourceRef.current = source;
  };

  const stopPlayback = () => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      setStatus(AppStatus.IDLE);
    }
  };

  const downloadSpeech = (speech: GeneratedSpeech) => {
    if (!speech.audioBuffer) return;
    const blob = audioBufferToWav(speech.audioBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxaura-speech-${speech.id.slice(0, 8)}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Mic2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">VoxAura</h1>
              <span className="text-[10px] text-purple-400 font-medium uppercase tracking-widest">Neural Voice Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings2 size={20} />
            </button>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-xs font-medium text-gray-300">Gemini 2.5 Pro Ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-8 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Volume2 size={18} className="text-blue-400" />
                Script
              </h2>
              <span className={`text-xs ${text.length > MAX_TEXT_LENGTH * 0.9 ? 'text-red-400' : 'text-gray-500'}`}>
                {text.length} / {MAX_TEXT_LENGTH}
              </span>
            </div>
            
            <div className="relative group">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
                placeholder="Type or paste your text here... Let the AI speak your words with stunning realism."
                className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none placeholder:text-gray-600"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                 {status === AppStatus.PLAYING ? (
                   <button 
                    onClick={stopPlayback}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-all shadow-lg shadow-red-500/20"
                   >
                     <Square size={18} fill="currentColor" />
                     Stop
                   </button>
                 ) : (
                   <button
                    disabled={!text.trim() || status === AppStatus.GENERATING}
                    onClick={handleGenerate}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-purple-500/25 active:scale-95"
                   >
                     {status === AppStatus.GENERATING ? (
                       <>
                         <Loader2 size={18} className="animate-spin" />
                         Generating...
                       </>
                     ) : (
                       <>
                         <Play size={18} fill="currentColor" />
                         Generate Voice
                       </>
                     )}
                   </button>
                 )}
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}
          </section>

          {/* Current Session Visualizer */}
          <section className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedVoice.previewColor} flex items-center justify-center text-xs font-bold`}>
                  {selectedVoice.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{selectedVoice.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{status === AppStatus.PLAYING ? 'Speaking' : 'Ready'}</p>
                </div>
              </div>
              <div className="flex-1 px-8">
                <AudioVisualizer analyser={analyserRef.current} isPlaying={status === AppStatus.PLAYING} />
              </div>
              <div className="text-right">
                 <p className="text-xs text-gray-500 font-mono">24.0kHz / PCM</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Voice Selection & History */}
        <div className="lg:col-span-4 space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold px-1">Voices</h2>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {AVAILABLE_VOICES.map(voice => (
                <VoiceCard 
                  key={voice.id}
                  voice={voice}
                  isSelected={selectedVoice.id === voice.id}
                  onSelect={setSelectedVoice}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History size={18} className="text-purple-400" />
                Recent
              </h2>
              <button 
                onClick={() => setHistory([])}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-white/5">
                  <p className="text-gray-600 text-sm">No recent generations</p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="glass p-4 rounded-xl group hover:border-white/20 transition-all">
                    <p className="text-xs text-gray-300 line-clamp-1 mb-3 italic">"{item.text}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => playSpeech(item)}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        >
                          <Play size={14} fill="currentColor" />
                        </button>
                        <span className="text-[10px] font-medium text-gray-500">
                          {Math.floor(item.duration)}s • {AVAILABLE_VOICES.find(v => v.id === item.voiceId)?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => downloadSpeech(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Download WAV"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
        <p>© 2024 VoxAura Studio. Powered by Google Gemini 2.5.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
