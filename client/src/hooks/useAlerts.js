import { useAlertStore } from '../store/alerts.store';
import { updateAlert } from '../api/alerts.api';

export function useAlerts() {
  const { alerts, unreadCount, resolveAlert } = useAlertStore();

  const resolve = async (id) => {
    await updateAlert(id, { isResolved: true });
    resolveAlert(id);
  };

  return { alerts, unreadCount, resolve };
}