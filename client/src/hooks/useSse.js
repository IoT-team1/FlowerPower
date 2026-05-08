import { useEffect } from 'react';
import sseService from '../services/sse.service';
import { useAlertStore } from '../store/alerts.store';

export function useSse() {
  useEffect(() => {
    sseService.connect();

    const unsubAlert = sseService.on('alert', (data) => {
      useAlertStore.getState().addAlert(data);
    });

    const unsubAlertResolved = sseService.on('alertResolved', (data) => {
      useAlertStore.getState().resolveAlert(data.alertId);
    });

    return () => {
      unsubAlert();
      unsubAlertResolved();
    };
  }, []);
}
sseService.on('alert', (data) => {
  console.log('SSE ALERT', data);
  useAlertStore.getState().addAlert(data);
});