export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: string;
  durationSeconds: number;
  audioUrl: string;
}

export interface InterceptRequest {
  trigger: string;
}

export interface InterceptResponse {
  prayer: Prayer;
  audioPath: string;
  instructions: string;
}

export interface LogRequest {
  actionType: 'pause' | 'prayer' | 'reflection';
  triggerContext: string;
}

export interface LogResponse {
  message: string;
  streak: {
    count: number;
    lastActiveDate: string;
  };
}
