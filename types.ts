
export interface Voice {
  id: string;
  name: string;
  description: string;
  category: 'Professional' | 'Narrator' | 'Character' | 'Conversational';
  previewColor: string;
}

export interface GeneratedSpeech {
  id: string;
  text: string;
  voiceId: string;
  timestamp: number;
  audioBuffer: AudioBuffer | null;
  duration: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}
