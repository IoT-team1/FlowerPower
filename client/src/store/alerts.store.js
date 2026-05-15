import { create } from 'zustand';

export const useAlertStore = create((set) => ({
  alerts: [],
  unreadCount: 0,

  setAlerts: (alerts) => set({
    alerts,
    unreadCount: alerts.filter((a) => !a.isResolved).length,
  }),

  addAlert: (alert) => set((state) => {
    const exists = state.alerts.some(
      (a) => a._id === alert._id
    );
    if (exists) return state;

    return {
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    };
  }),

  resolveAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map((a) =>
      a._id === alertId ? { ...a, isResolved: true } : a
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
})),

  markAllRead: () => set((state) => ({
    alerts: state.alerts.map((a) => ({ ...a, isResolved: true })),
    unreadCount: 0,
  })),
}));