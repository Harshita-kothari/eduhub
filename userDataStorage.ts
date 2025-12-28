import { User } from '@/contexts/AuthContext';

export interface UserData {
  tasks: any[];
  habits: any[];
  notes: any[];
  mood: any[];
  schedule: any[];
  settings: any;
  analytics: any;
  focusSessions: any[];
}

export interface CompleteUser extends User {
  data: UserData;
}

const USER_DATA_PREFIX = 'focus-flow-user-data-';

export class UserDataStorage {
  static getUserDataKey(userId: string): string {
    return `${USER_DATA_PREFIX}${userId}`;
  }

  static initializeUserData(userId: string): UserData {
    return {
      tasks: [],
      habits: [],
      notes: [],
      mood: [],
      schedule: [],
      settings: {
        theme: 'dark',
        notifications: true,
        focusDuration: 25,
        breakDuration: 5,
        language: 'en'
      },
      analytics: {
        totalFocusTime: 0,
        tasksCompleted: 0,
        habitsCompleted: 0,
        streakDays: 0
      },
      focusSessions: []
    };
  }

  static saveUserData(userId: string, data: Partial<UserData>): void {
    try {
      const key = this.getUserDataKey(userId);
      const existingData = this.getUserData(userId);
      const updatedData = { ...existingData, ...data };
      localStorage.setItem(key, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  static getUserData(userId: string): UserData {
    try {
      const key = this.getUserDataKey(userId);
      const dataStr = localStorage.getItem(key);
      if (!dataStr) {
        const initialData = this.initializeUserData(userId);
        this.saveUserData(userId, initialData);
        return initialData;
      }
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Error loading user data:', error);
      return this.initializeUserData(userId);
    }
  }

  static updateUserData(userId: string, section: keyof UserData, data: any): void {
    try {
      const currentData = this.getUserData(userId);
      currentData[section] = data;
      this.saveUserData(userId, currentData);
    } catch (error) {
      console.error('Error updating user data section:', error);
    }
  }

  static deleteUserData(userId: string): void {
    try {
      const key = this.getUserDataKey(userId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  }

  static getAllUserData(): Record<string, UserData> {
    try {
      const allData: Record<string, UserData> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(USER_DATA_PREFIX)) {
          const userId = key.replace(USER_DATA_PREFIX, '');
          const data = this.getUserData(userId);
          allData[userId] = data;
        }
      }
      return allData;
    } catch (error) {
      console.error('Error getting all user data:', error);
      return {};
    }
  }

  static exportUserData(userId: string): string {
    try {
      const userData = this.getUserData(userId);
      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      return '{}';
    }
  }

  static importUserData(userId: string, jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (this.isValidUserData(data)) {
        this.saveUserData(userId, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }

  private static isValidUserData(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.tasks) &&
      Array.isArray(data.habits) &&
      Array.isArray(data.notes) &&
      Array.isArray(data.mood) &&
      Array.isArray(data.schedule) &&
      typeof data.settings === 'object' &&
      typeof data.analytics === 'object' &&
      Array.isArray(data.focusSessions)
    );
  }
}
