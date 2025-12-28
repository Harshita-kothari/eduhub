import { motion } from 'framer-motion';
import { Moon, Sun, Volume2, VolumeX, Type, Palette, Trash2, User, Download, Upload, LogOut } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { UserSettings } from '@/types/productivity';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserDataStorage } from '@/lib/userDataStorage';
import { useNavigate } from 'react-router-dom';

const defaultSettings: UserSettings = {
  theme: 'dark',
  accentColor: 'purple',
  fontSize: 'medium',
  soundEnabled: true,
};

const Settings = () => {
  const { user, logout, userData } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useUserLocalStorage<UserSettings>('user-settings', defaultSettings);

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const handleClearData = () => {
    if (!user) return;
    
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      UserDataStorage.deleteUserData(user.id);
      window.location.reload();
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const handleExportData = () => {
    if (!user) return;
    
    const dataStr = UserDataStorage.exportUserData(user.id);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focus-flow-data-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    if (!user) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (UserDataStorage.importUserData(user.id, content)) {
            alert('Data imported successfully! Refresh to see changes.');
            window.location.reload();
          } else {
            alert('Invalid data format. Please check the file and try again.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const accentColors = [
    { id: 'purple', color: '#8B5CF6', label: 'Purple' },
    { id: 'blue', color: '#3B82F6', label: 'Blue' },
    { id: 'green', color: '#10B981', label: 'Green' },
    { id: 'orange', color: '#F59E0B', label: 'Orange' },
  ];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your productivity experience.
          </p>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 space-y-6"
        >
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </h3>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  {settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.theme === 'dark'}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, theme: checked ? 'dark' : 'light' })
              }
            />
          </div>

          {/* Accent Color */}
          <div>
            <p className="font-medium mb-3">Accent Color</p>
            <div className="flex gap-3">
              {accentColors.map((accent) => (
                <button
                  key={accent.id}
                  onClick={() =>
                    setSettings({ ...settings, accentColor: accent.id as UserSettings['accentColor'] })
                  }
                  className={cn(
                    "w-10 h-10 rounded-full transition-all",
                    settings.accentColor === accent.id && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                  )}
                  style={{ backgroundColor: accent.color }}
                  title={accent.label}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-5 h-5 text-muted-foreground" />
              <p className="font-medium">Font Size</p>
            </div>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSettings({ ...settings, fontSize: size })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm capitalize transition-colors",
                    settings.fontSize === size
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sound */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Sound Effects</p>
                <p className="text-sm text-muted-foreground">
                  Play sounds for notifications
                </p>
              </div>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, soundEnabled: checked })
              }
            />
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 space-y-6"
        >
          <h3 className="font-display font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Account
          </h3>

          <div className="space-y-4">
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {user ? new Date(user.createdAt).toLocaleDateString() : ''}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 space-y-4"
        >
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Data Management
          </h3>

          <p className="text-sm text-muted-foreground">
            All your data is stored locally on your device. You can export, import, or clear your data.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>

          {userData && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Data Summary:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Tasks: {userData.tasks.length}</div>
                <div>Habits: {userData.habits.length}</div>
                <div>Notes: {userData.notes.length}</div>
                <div>Mood Entries: {userData.mood.length}</div>
                <div>Schedule Items: {userData.schedule.length}</div>
                <div>Focus Sessions: {userData.focusSessions.length}</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 text-center"
        >
          <h3 className="font-display font-semibold mb-2">ProductivityHub</h3>
          <p className="text-sm text-muted-foreground">
            Your all-in-one productivity dashboard for students and professionals.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Built with ❤️ for productivity enthusiasts
          </p>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Settings;
