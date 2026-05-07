export interface AgentEvent {
  ts: number;
  level: 'info' | 'warn' | 'error' | 'signal';
  msg: string;
}

export interface RunningAgent {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'stopped' | 'error';
  events: AgentEvent[];
  stop: () => void;
}
