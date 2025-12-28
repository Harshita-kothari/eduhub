export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completedDates: string[];
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  energy: number;
  note?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  duration: number;
  completedAt: string;
  type: 'focus' | 'break';
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  progress: number;
  subTasks: { id: string; title: string; completed: boolean }[];
  createdAt: string;
}

export interface DailyScheduleItem {
  id: string;
  time: string;
  task: string;
  subject?: string;
  completed: boolean;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  accentColor: 'purple' | 'blue' | 'green' | 'orange';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
}
