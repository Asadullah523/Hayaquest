import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncService } from '../services/syncService';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerConfig {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  focusSound: 'beep' | 'chime' | 'bell' | 'buzz' | 'alarm' | 'digital' | 'hero' | 'pleasant' | 'calm' | 'strong' | 'urgent' | 'nuclear';
  breakSound: 'beep' | 'chime' | 'bell' | 'buzz' | 'alarm' | 'digital' | 'hero' | 'pleasant' | 'calm' | 'strong' | 'urgent' | 'nuclear';
  alarmDuration: number;
  showMiniTimer: boolean;
}

interface TimerState {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  config: TimerConfig;
  timerReferenceTime: number | null; // Timestamp when timer was started/resumed
  timeLeftWhenStarted: number; // Time remaining when timer was started
  activeSession: {
    startTime: number;
    elapsedSeconds: number;
    subjectId?: number;
    type: 'focus' | 'break';
    subjectDist: Record<number, number>; // subjectId -> seconds
  } | null;
  sessionHistory: Array<{
    id: string;
    startTime: number;
    endTime: number;
    duration: number;
    type: 'focus' | 'break';
    subjectId?: number;
    completed: boolean;
  }>;
  todayStats: {
    totalFocusTime: number;
    totalBreakTime: number;
    sessionsCompleted: number;
    lastUpdatedDate: string; // YYYY-MM-DD
    subjectFocusTime: Record<number, number>; // subjectId -> seconds
  };
  
  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  updateConfig: (config: Partial<TimerConfig>) => void;
  playNotificationSound: (type: 'focus' | 'break') => void;
  stopSound: () => void;
  startSession: (subjectId?: number) => void;
  completeSession: () => void;
  getTodayStats: () => { totalFocusTime: number; totalBreakTime: number; sessionsCompleted: number };
}

const DEFAULT_CONFIG: TimerConfig = {
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  focusSound: 'strong',
  breakSound: 'pleasant',
  alarmDuration: 10,
  showMiniTimer: true,
};

// Simple sound generator using Web Audio API
let audioContext: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playSound = (type: 'beep' | 'chime' | 'bell' | 'buzz' | 'alarm' | 'digital' | 'hero' | 'pleasant' | 'calm' | 'strong' | 'urgent' | 'nuclear', duration: number = 10) => {
  try {
    // Stop any currently playing sound
    stopSound();

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error);
    }
    
    if (type === 'beep') {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
      activeOscillators.push(oscillator);
    } else if (type === 'chime') {
      const playChimeNote = (freq: number, delay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.5);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.5);
        activeOscillators.push(osc);
      };
      playChimeNote(523.25, 0); // C5
      playChimeNote(659.25, 0.1); // E5
    } else if (type === 'bell') {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1);
      activeOscillators.push(oscillator);
    } else if (type === 'buzz') {
      // Strong pulsing buzz sound
      const pulseRate = 0.5; // seconds
      
      for (let i = 0; i < duration / pulseRate; i++) {
        const startTime = ctx.currentTime + (i * pulseRate);
        const playDuration = pulseRate * 0.7;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'square'; // Stronger, harmonic-rich sound
        oscillator.frequency.value = 150; // Low frequency buzz
        
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + playDuration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + playDuration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + playDuration);
        activeOscillators.push(oscillator);
      }
    } else if (type === 'alarm') {
      // Urgent intense alarm (sawtooth) - repeat for duration
      const loopDuration = 0.5 * 6; // 3 seconds per loop
      const loops = Math.ceil(duration / loopDuration);

      for(let loop = 0; loop < loops; loop++) {
        const loopStart = loop * loopDuration;
        if(loopStart >= duration) break;
        
        for(let i=0; i<6; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            const stepStart = loopStart + (i * 0.5);
            if(stepStart >= duration) break;

            const startTime = ctx.currentTime + stepStart;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, startTime);
            osc.frequency.linearRampToValueAtTime(1200, startTime + 0.2);
            
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.3);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
            activeOscillators.push(osc);
        }
      }
    } else if (type === 'digital') {
        const loopLen = 0.3; 
        const loops = Math.ceil(duration / loopLen);
        for(let l=0; l<loops; l++) {
           const t = ctx.currentTime + (l * 1.5); // gap between beeps
           if(l * 1.5 >= duration) break;

           const playTone = (freq: number, time: number, dur: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.1, time);
                gain.gain.linearRampToValueAtTime(0, time + dur);
                osc.start(time);
                osc.stop(time + dur);
                activeOscillators.push(osc);
            };
            playTone(1200, t, 0.1);
            playTone(1800, t + 0.1, 0.1);
            playTone(1200, t + 0.2, 0.1);
        }
    } else if (type === 'hero') {
        // Just play once as it's a victory fanfare
         const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50]; // C E G C
        const timings = [0, 0.15, 0.3, 0.45, 0.6, 0.9];
        const lengths = [0.1, 0.1, 0.1, 0.15, 0.2, 0.6];
        
        notes.forEach((note, i) => {
             const osc = ctx.createOscillator();
             const gain = ctx.createGain();
             osc.connect(gain);
             gain.connect(ctx.destination);
             
             const startTime = ctx.currentTime + timings[i];
             osc.type = 'triangle';
             osc.frequency.value = note;
             
             gain.gain.setValueAtTime(0.2, startTime);
             gain.gain.exponentialRampToValueAtTime(0.001, startTime + lengths[i]);
             
             osc.start(startTime);
             osc.stop(startTime + lengths[i] + 0.1);
             activeOscillators.push(osc);
        });
    } else if (type === 'pleasant') {
        // Pleasant melodic reminder
        // C Major scale with harmonies: C, D, E, F, G, A, B, C
        const melodyNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        const harmony1 = [329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 622.25, 659.25]; // Thirds
        const harmony2 = [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 739.99, 783.99]; // Fifths
        
        // Loop based on duration
        const patternDuration = 3.3; 
        const repeats = Math.ceil(duration / patternDuration);

        for (let repeat = 0; repeat < repeats; repeat++) {
          melodyNotes.forEach((note, i) => {
            const startTime = ctx.currentTime + (repeat * patternDuration) + (i * 0.4);
            if (startTime - ctx.currentTime >= duration) return;

            const noteDuration = 0.6;
            
            // Main melody
            [note, harmony1[i], harmony2[i]].forEach((freq, harmonyIndex) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              
              osc.type = 'sine';
              osc.frequency.value = freq;
              
              const volume = harmonyIndex === 0 ? 0.15 : 0.08; // Melody louder than harmony
              gain.gain.setValueAtTime(volume, startTime);
              gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
              
              osc.start(startTime);
              osc.stop(startTime + noteDuration + 0.1);
              activeOscillators.push(osc);
            });
          });
        }
    } else if (type === 'calm') {
        // Calm pleasant reminder
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; 
        const sequence = [0, 2, 4, 3, 1, 0, 2, 4, 3, 1]; // Pattern 10s roughly
        
        // Just repeat if duration > 10s
        const patternDuration = 10;
        const repeats = Math.ceil(duration / patternDuration);

        for (let r=0; r<repeats; r++) {
            sequence.forEach((noteIndex, i) => {
                const startTime = ctx.currentTime + (r * patternDuration) + (i * 1.0); 
                if (startTime - ctx.currentTime >= duration) return;

                const freq = notes[noteIndex];
                
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.5);
                
                osc.start(startTime);
                osc.stop(startTime + 3);
                activeOscillators.push(osc);
            });
        }

    } else if (type === 'strong') {
        const pulseInterval = 0.4;
        const numPulses = Math.floor(duration / pulseInterval);
        
        for (let i = 0; i < numPulses; i++) {
          const startTime = ctx.currentTime + (i * pulseInterval);
          const pulseDuration = 0.3;
          
          [800, 1000].forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            const volume = (i % 2 === index) ? 0.25 : 0.15;
            gain.gain.setValueAtTime(volume, startTime);
            gain.gain.linearRampToValueAtTime(0.05, startTime + pulseDuration * 0.8);
            gain.gain.linearRampToValueAtTime(0, startTime + pulseDuration);
            
            osc.start(startTime);
            osc.stop(startTime + pulseDuration);
            activeOscillators.push(osc);
          });
          
          if (i % 2 === 0) {
            const bass = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bass.connect(bassGain);
            bassGain.connect(ctx.destination);
            bass.type = 'sine';
            bass.frequency.value = 100;
            
            bassGain.gain.setValueAtTime(0.2, startTime);
            bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
            bass.start(startTime);
            bass.stop(startTime + 0.15);
            activeOscillators.push(bass);
          }
        }
    } else if (type === 'urgent') {
        const pulseInterval = 0.25;
        const numPulses = Math.floor(duration / pulseInterval);
        
        for (let i = 0; i < numPulses; i++) {
          const startTime = ctx.currentTime + (i * pulseInterval);
          const pulseDuration = 0.1;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'square';
          osc.frequency.value = 1500;
          
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.setValueAtTime(0.15, startTime + pulseDuration);
          gain.gain.linearRampToValueAtTime(0, startTime + pulseDuration + 0.05);
          
          osc.start(startTime);
          osc.stop(startTime + pulseDuration + 0.1);
          activeOscillators.push(osc);
        }
    } else if (type === 'nuclear') {
        const sweepDuration = 2.5; 
        const numSweeps = Math.floor(duration / sweepDuration);
        
        for (let i = 0; i < numSweeps; i++) {
          const startTime = ctx.currentTime + (i * sweepDuration);
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, startTime);
          osc.frequency.linearRampToValueAtTime(1500, startTime + (sweepDuration / 2));
          osc.frequency.linearRampToValueAtTime(600, startTime + sweepDuration);
          
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.linearRampToValueAtTime(0.2, startTime + sweepDuration - 0.1);
          gain.gain.linearRampToValueAtTime(0, startTime + sweepDuration);
          
          osc.start(startTime);
          osc.stop(startTime + sweepDuration);
          activeOscillators.push(osc);
        }
    }
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

const stopSound = () => {
  activeOscillators.forEach(osc => {
    try { 
      osc.stop(); 
      osc.disconnect();
    } catch (e) {}
  });
  activeOscillators = [];
  
  // Aggressively kill sound by suspending context
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.suspend().catch(console.error);
  }
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timeLeft: DEFAULT_CONFIG.focusDuration,
      isActive: false,
      mode: 'focus',
      config: DEFAULT_CONFIG,
      timerReferenceTime: null,
      timeLeftWhenStarted: DEFAULT_CONFIG.focusDuration,
      activeSession: null,
      sessionHistory: [],
      todayStats: {
        totalFocusTime: 0,
        totalBreakTime: 0,
        sessionsCompleted: 0,
        lastUpdatedDate: new Date().toISOString().split('T')[0],
        subjectFocusTime: {},
      },

      start: () => {
        // Resume AudioContext on user interaction
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(console.error);
        }

        // Check if day changed
        const today = new Date().toISOString().split('T')[0];
        const { todayStats } = get();
        if (todayStats.lastUpdatedDate !== today) {
          set({
            todayStats: {
              totalFocusTime: 0,
              totalBreakTime: 0,
              sessionsCompleted: 0,
              lastUpdatedDate: today,
              subjectFocusTime: {},
            }
          });
        }

        // Initialize active session if not exists (captures 'no subject' starts)
        const { activeSession, mode } = get();
        if (!activeSession) {
           set({
            activeSession: {
              startTime: Date.now(),
              elapsedSeconds: 0,
              subjectId: undefined,
              type: mode === 'focus' ? 'focus' : 'break',
              subjectDist: {},
            },
          });
        }

        set({ 
          isActive: true,
          timerReferenceTime: Date.now(),
          timeLeftWhenStarted: get().timeLeft
        });
      },
      
      pause: () => {
        const { timerReferenceTime, timeLeftWhenStarted } = get();
        
        // Calculate actual elapsed time before pausing
        if (timerReferenceTime) {
          const elapsedMs = Date.now() - timerReferenceTime;
          const elapsedSeconds = Math.floor(elapsedMs / 1000);
          const actualTimeLeft = Math.max(0, timeLeftWhenStarted - elapsedSeconds);
          
          set({ 
            isActive: false,
            timeLeft: actualTimeLeft,
            timerReferenceTime: null
          });
        } else {
          set({ isActive: false, timerReferenceTime: null });
        }
        
        stopSound();
      },
      
      reset: () => {
        const { mode, config, activeSession } = get();
        
        // Salvage time if resetting
        if (activeSession && activeSession.type === 'focus' && activeSession.elapsedSeconds > 5) {
            get().completeSession();
        }

        let duration = config.focusDuration;
        if (mode === 'shortBreak') duration = config.shortBreakDuration;
        if (mode === 'longBreak') duration = config.longBreakDuration;
        
        stopSound();
        set({ 
          isActive: false, 
          timeLeft: duration, 
          activeSession: null,
          timerReferenceTime: null,
          timeLeftWhenStarted: duration
        });
      },

      tick: () => {
        const { isActive, timerReferenceTime, timeLeftWhenStarted, mode, todayStats, activeSession } = get();
        if (!isActive || !timerReferenceTime) return;

        // Calculate actual elapsed time from timestamp
        const now = Date.now();
        const totalElapsedSeconds = Math.floor((now - timerReferenceTime) / 1000);
        const actualTimeLeft = Math.max(0, timeLeftWhenStarted - totalElapsedSeconds);

        // Calculate how many NEW seconds have elapsed since we last updated the state
        // This is important for cumulative stats
        const currentlyDisplayedTimeLeft = get().timeLeft;
        const secondsToAccountFor = currentlyDisplayedTimeLeft - actualTimeLeft;

        if (secondsToAccountFor <= 0 && actualTimeLeft > 0) return;

        if (actualTimeLeft > 0) {
          // Increment today's stats by the number of seconds that passed
          const newStats = { ...todayStats };
          
          // Check if day changed during tick
          const today = new Date().toISOString().split('T')[0];
          if (newStats.lastUpdatedDate !== today) {
            newStats.totalFocusTime = 0;
            newStats.totalBreakTime = 0;
            newStats.sessionsCompleted = 0;
            newStats.lastUpdatedDate = today;
            newStats.subjectFocusTime = {};
          }

          if (mode === 'focus') {
            newStats.totalFocusTime += secondsToAccountFor;
            
            // Track subject-wise time
            if (activeSession && activeSession.subjectId) {
              const sid = activeSession.subjectId;
              newStats.subjectFocusTime = { ...newStats.subjectFocusTime };
              newStats.subjectFocusTime[sid] = (newStats.subjectFocusTime[sid] || 0) + secondsToAccountFor;
            }
          } else {
            newStats.totalBreakTime += secondsToAccountFor;
          }
          
          set((state) => ({ 
            timeLeft: actualTimeLeft,
            todayStats: newStats,
            activeSession: state.activeSession ? {
                ...state.activeSession,
                elapsedSeconds: state.activeSession.elapsedSeconds + secondsToAccountFor,
                subjectDist: mode === 'focus' && state.activeSession.subjectId 
                    ? { 
                        ...state.activeSession.subjectDist, 
                        [state.activeSession.subjectId]: (state.activeSession.subjectDist[state.activeSession.subjectId] || 0) + secondsToAccountFor 
                      } 
                    : state.activeSession.subjectDist
            } : null
          }));
        } else if (actualTimeLeft === 0) {
          // One final update to stats to make sure we reach the exact goal
          const finalSecondsToAccountFor = currentlyDisplayedTimeLeft;
          const newStats = { ...todayStats };
          
          if (mode === 'focus') {
            newStats.totalFocusTime += finalSecondsToAccountFor;
            if (activeSession && activeSession.subjectId) {
              const sid = activeSession.subjectId;
              newStats.subjectFocusTime = { ...newStats.subjectFocusTime };
              newStats.subjectFocusTime[sid] = (newStats.subjectFocusTime[sid] || 0) + finalSecondsToAccountFor;
            }
          } else {
            newStats.totalBreakTime += finalSecondsToAccountFor;
          }

          // Auto-complete when timer reaches 0
          const { config } = get();
          
          // Set state first before completeSession to ensure timeLeft is 0 for stats
          set((state) => ({ 
            isActive: false, 
            timeLeft: 0,
            todayStats: newStats,
            activeSession: state.activeSession ? {
                ...state.activeSession,
                elapsedSeconds: state.activeSession.elapsedSeconds + finalSecondsToAccountFor,
                subjectDist: mode === 'focus' && state.activeSession.subjectId 
                    ? { 
                        ...state.activeSession.subjectDist, 
                        [state.activeSession.subjectId]: (state.activeSession.subjectDist[state.activeSession.subjectId] || 0) + finalSecondsToAccountFor 
                      } 
                    : state.activeSession.subjectDist
            } : null
          }));
          
          // Complete the session if there's an active one
          get().completeSession();
          
          // Play notification sound
          if (config.soundEnabled) {
            const soundType = mode === 'focus' ? config.focusSound : config.breakSound;
            playSound(soundType, config.alarmDuration);
          }
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(mode === 'focus' ? 'Focus Session Complete! 🎉' : 'Break Time Over! 💪', {
              body: mode === 'focus' ? 'Great work! Time for a break.' : 'Back to focus mode!',
              icon: '/favicon.ico',
            });
          }

          // Auto-start next session if enabled
          if (mode === 'focus' && config.autoStartBreaks) {
            setTimeout(() => {
              get().setMode('shortBreak');
              get().start();
            }, 1000);
          } else if (mode === 'shortBreak' && config.autoStartPomodoros) {
            setTimeout(() => {
              get().setMode('focus');
              get().start();
            }, 1000);
          }
        }
      },
      
      completeTimer: () => {
          const { mode, config } = get();
          set({ isActive: false });
          
          if (config.soundEnabled) {
            const soundType = mode === 'focus' ? config.focusSound : config.breakSound;
            playSound(soundType, config.alarmDuration);
          }
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(mode === 'focus' ? 'Focus Session Complete! 🎉' : 'Break Time Over! 💪', {
              body: mode === 'focus' ? 'Great work! Time for a break.' : 'Back to focus mode!',
              icon: '/pwa-192x192.png',
            });
          }
      },

      setMode: (mode) => {
        const { config } = get();
        let duration = config.focusDuration;
        if (mode === 'shortBreak') duration = config.shortBreakDuration;
        if (mode === 'longBreak') duration = config.longBreakDuration;

        stopSound();
        set({ mode, timeLeft: duration, isActive: false, activeSession: null });
      },

      updateConfig: (newConfig) => {
        set((state) => {
          const config = { ...state.config, ...newConfig };
          let { timeLeft, mode, isActive } = state;

          // If the timer is not active, update timeLeft immediately when durations change
          if (!isActive) {
            if (mode === 'focus' && newConfig.focusDuration !== undefined) {
              timeLeft = newConfig.focusDuration;
            } else if (mode === 'shortBreak' && newConfig.shortBreakDuration !== undefined) {
              timeLeft = newConfig.shortBreakDuration;
            } else if (mode === 'longBreak' && newConfig.longBreakDuration !== undefined) {
              timeLeft = newConfig.longBreakDuration;
            }
          }

          return { config, timeLeft };
        });
      },

      playNotificationSound: (type: 'focus' | 'break') => {
        const { config } = get();
        if (config.soundEnabled) {
          const soundType = type === 'focus' ? config.focusSound : config.breakSound;
          playSound(soundType, config.alarmDuration);
        }
      },

      stopSound: () => {
        stopSound();
      },

      startSession: (subjectId?: number) => {
        const { mode, activeSession } = get();
        
        // If session exists, just update the subject attribution
        // This ensures the WHOLE session counts towards the final selected subject
        if (activeSession) {
            set({
                activeSession: {
                    ...activeSession,
                    subjectId
                }
            });
        } else {
            // Start fresh session
            set({
              activeSession: {
                startTime: Date.now(),
                elapsedSeconds: 0,
                subjectId,
                type: mode === 'focus' ? 'focus' : 'break',
                subjectDist: {},
              },
            });
        }
      },

      completeSession: () => {
        const { activeSession, sessionHistory, todayStats } = get();
        
        if (!activeSession) return;

        const endTime = Date.now();
        const duration = activeSession.elapsedSeconds;
        const sessionType = activeSession.type;

        // Add to session history
        const newSession = {
          id: `session-${Date.now()}`,
          startTime: activeSession.startTime,
          endTime,
          duration,
          type: sessionType,
          subjectId: activeSession.subjectId,
          completed: true,
        };

        // Persist to Database for Analytics
        if (sessionType === 'focus' && duration > 5) {
            import('./useLogStore').then(({ useLogStore }) => {
                const store = useLogStore.getState();
                const dist = activeSession.subjectDist;
                
                // If we have a distribution, log per subject
                if (Object.keys(dist).length > 0) {
                    Object.entries(dist).forEach(([sid, seconds]) => {
                        if (seconds > 0) {
                            store.addLog({
                                date: endTime,
                                subjectId: parseInt(sid),
                                durationSeconds: seconds,
                                type: 'learning',
                                timestamp: endTime,
                                notes: 'Timer Session'
                            });
                        }
                    });
                } else if (activeSession.subjectId) {
                    // Fallback to the main subjectId if dist is empty for some reason
                    store.addLog({
                        date: endTime,
                        subjectId: activeSession.subjectId,
                        durationSeconds: duration,
                        type: 'learning',
                        timestamp: endTime,
                        notes: 'Timer Session'
                    });
                }
            }).catch(console.error);

            // Access Timetable Store to auto-complete agenda slots
            if (activeSession.subjectId) {
                import('./useTimetableStore').then(({ useTimetableStore }) => {
                    useTimetableStore.getState().autoMarkSlotComplete(activeSession.subjectId!);
                }).catch(console.error);
            }
        }

        // Update today's stats
        const newStats = { ...todayStats };
        // Increment sessionsCompleted only for focus sessions that reached natural completion (0:00)
        if (sessionType === 'focus' && get().timeLeft === 0) {
          newStats.sessionsCompleted += 1;
        }

        set({
          sessionHistory: [newSession, ...sessionHistory].slice(0, 50), // Keep last 50 sessions
          todayStats: newStats,
          activeSession: null,
        });

        // Trigger cloud backup
        syncService.triggerAutoBackup();
      },

      getTodayStats: () => {
        const { todayStats } = get();
        return todayStats;
      }
    }),
    {
      name: 'antigravity-timer-storage',
    }
  )
);
