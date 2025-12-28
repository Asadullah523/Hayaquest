import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../db/db';
import type { TimetableSlot } from '../types';
import { syncService } from '../services/syncService';
import { useAuthStore } from './useAuthStore';

const getCurrentUserId = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  return isAuthenticated && user ? user.email : 'guest';
};

interface TimetableState {
  slots: TimetableSlot[];
  isLoading: boolean;
  error: string | null;
  startHour: number;
  endHour: number;
  completedSlots: Record<string, number[]>;

  loadTimetable: () => Promise<void>;
  assignSlot: (slot: Omit<TimetableSlot, 'id'>) => Promise<void>;
  clearSlot: (dayOfWeek: number, startTime: string) => Promise<void>;
  moveSlot: (fromDay: number, fromTime: string, toDay: number, toTime: string) => Promise<void>;
  updateTimetableHours: (start: number, end: number) => void;
  getTodaySlots: () => TimetableSlot[];
  getCurrentSlot: () => TimetableSlot | null;
  getUpcomingSlot: () => TimetableSlot | null;
  toggleSlotComplete: (date: string, slotId: number) => void;
  isSlotCompleted: (date: string, slotId: number) => boolean;
  autoMarkSlotComplete: (subjectId: number) => void;
}

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set, get) => ({
      slots: [],
      completedSlots: {}, // { "YYYY-MM-DD": [slotId1, slotId2] }
      isLoading: false,
      error: null,
      startHour: 8,
      endHour: 20,

      loadTimetable: async () => {
        set({ isLoading: true });
        try {
          const userId = getCurrentUserId();
          const slots = await db.timetable.where('userId').equals(userId).toArray();
          set({ slots, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load timetable', isLoading: false });
          console.error(error);
        }
      },

      autoMarkSlotComplete: (subjectId: number) => {
          const { slots, toggleSlotComplete, isSlotCompleted } = get();
          const now = new Date();
          const currentDay = now.getDay();
          const todayDateStr = now.toISOString().split('T')[0];
          
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTime = currentHours * 60 + currentMinutes;

          // Find a slot for this subject today that effectively "just finished" or is "active"
          const targetSlot = slots.find(s => {
              if (s.subjectId !== subjectId || s.dayOfWeek !== currentDay) return false;
              if (!s.id || isSlotCompleted(todayDateStr, s.id)) return false;

              const [startH, startM] = s.startTime.split(':').map(Number);
              const [endH, endM] = s.endTime.split(':').map(Number);
              const startT = startH * 60 + startM;
              const endT = endH * 60 + endM;

              // Check if NOW is within [startTime, endTime + 15mins buffer]
              // Allowing buffer because session might finish slightly after slot end
              return currentTime >= startT && currentTime <= (endT + 15);
          });

          if (targetSlot && targetSlot.id) {
              toggleSlotComplete(todayDateStr, targetSlot.id);
          }
      },

      toggleSlotComplete: (date: string, slotId: number) => {
          const { completedSlots } = get();
          const daySlots = completedSlots[date] || [];
          const isCompleted = daySlots.includes(slotId);
          
          const newDaySlots = isCompleted 
            ? daySlots.filter(id => id !== slotId)
            : [...daySlots, slotId];
            
          set({
              completedSlots: {
                  ...completedSlots,
                  [date]: newDaySlots
              }
          });
          syncService.triggerAutoBackup();
      },

      isSlotCompleted: (date: string, slotId: number) => {
          const { completedSlots } = get();
          return (completedSlots[date] || []).includes(slotId);
      },

      assignSlot: async (slotData) => {
        try {
            const userId = getCurrentUserId();
            const existing = await db.timetable
                .where({ dayOfWeek: slotData.dayOfWeek as any, startTime: slotData.startTime, userId })
                .first();

            if (existing && existing.id) {
                await db.timetable.update(existing.id, slotData);
            } else {
                await db.timetable.add({ ...slotData, userId } as TimetableSlot);
            }
            
            // Reload
            const slots = await db.timetable.where('userId').equals(userId).toArray();
            set({ slots });
            syncService.triggerAutoBackup();
        } catch (error) {
            set({ error: 'Failed to assign slot' });
            console.error(error);
        }
      },

      clearSlot: async (dayOfWeek, startTime) => {
          try {
               const userId = getCurrentUserId();
               const existing = await db.timetable
                .where({ dayOfWeek, startTime, userId })
                .first();
               
               if (existing && existing.id) {
                   await db.timetable.delete(existing.id);
                   // Reload
                   const slots = await db.timetable.where('userId').equals(userId).toArray();
                   set({ slots });
                   syncService.triggerAutoBackup();
               }
          } catch (error) {
              console.error(error);
          }
      },

      moveSlot: async (fromDay, fromTime, toDay, toTime) => {
          try {
              const userId = getCurrentUserId();
              const slot = await db.timetable
                 .where({ dayOfWeek: fromDay, startTime: fromTime, userId })
                 .first();
              
              if (!slot || !slot.id) return;

              // Calculate duration
              const [startH, startM] = slot.startTime.split(':').map(Number);
              const [endH, endM] = slot.endTime.split(':').map(Number);
              
              const startTotalMins = startH * 60 + startM;
              const endTotalMins = endH * 60 + endM;
              const durationMins = endTotalMins - startTotalMins;

              // Calculate new endTime based on new toTime
              const [newStartH, newStartM] = toTime.split(':').map(Number);
              const newStartTotalMins = newStartH * 60 + newStartM;
              const newEndTotalMins = newStartTotalMins + durationMins;

              const newEndH = Math.floor(newEndTotalMins / 60) % 24;
              const newEndM = newEndTotalMins % 60;
              const newEndTime = `${newEndH.toString().padStart(2, '0')}:${newEndM.toString().padStart(2, '0')}`;

              // Check if target is occupied
              const targetSlot = await db.timetable
                 .where({ dayOfWeek: toDay, startTime: toTime, userId })
                 .first();
              
              if (targetSlot) {
                  if (targetSlot.id) await db.timetable.delete(targetSlot.id);
              }

              // Update source slot
              await db.timetable.update(slot.id, {
                  dayOfWeek: toDay as any,
                  startTime: toTime,
                  endTime: newEndTime
              });

              // Reload
              const slots = await db.timetable.where('userId').equals(userId).toArray();
              set({ slots });
              syncService.triggerAutoBackup();

          } catch (error) {
              console.error("Failed to move slot", error);
          }
      },

      updateTimetableHours: (start, end) => {
        set({ startHour: start, endHour: end });
        syncService.triggerAutoBackup();
      },

      getTodaySlots: () => {
        const today = new Date().getDay();
        const { slots } = get();
        return slots.filter((s: TimetableSlot) => s.dayOfWeek === today);
      },

      getCurrentSlot: () => {
        const now = new Date();
        const currentDay = now.getDay();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeMinutes = currentHours * 60 + currentMinutes;
        
        const { slots } = get();
        
        return slots.find((s: TimetableSlot) => {
          if (s.dayOfWeek !== currentDay) return false;
          
          const [startHours, startMinutes] = s.startTime.split(':').map(Number);
          const [endHours, endMinutes] = s.endTime.split(':').map(Number);
          
          const startTimeMinutes = startHours * 60 + startMinutes;
          const endTimeMinutes = endHours * 60 + endMinutes;
          
          return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
        }) || null;
      },

      getUpcomingSlot: () => {
        const now = new Date();
        const currentDay = now.getDay();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeMinutes = currentHours * 60 + currentMinutes;
        
        const { slots } = get();
        const todaySlots = slots.filter((s: TimetableSlot) => s.dayOfWeek === currentDay);
        
        const upcomingSlots = todaySlots.filter((s: TimetableSlot) => {
          const [startHours, startMinutes] = s.startTime.split(':').map(Number);
          const startTimeMinutes = startHours * 60 + startMinutes;
          return startTimeMinutes > currentTimeMinutes;
        });
        
        if (upcomingSlots.length === 0) return null;
        
        // Return the earliest upcoming slot
        return upcomingSlots.reduce((earliest: TimetableSlot, current: TimetableSlot) => {
          const [earliestHours, earliestMinutes] = earliest.startTime.split(':').map(Number);
          const [currentHours, currentMinutes] = current.startTime.split(':').map(Number);
          
          const earliestTimeMinutes = earliestHours * 60 + earliestMinutes;
          const currentTimeMinutes = currentHours * 60 + currentMinutes;
          
          return currentTimeMinutes < earliestTimeMinutes ? current : earliest;
        });
      }
    }),
    {
      name: 'timetable-settings',
      partialize: (state) => ({ 
          startHour: state.startHour, 
          endHour: state.endHour,
          completedSlots: state.completedSlots // Persist completed slots
      }),
    }
  )
);
