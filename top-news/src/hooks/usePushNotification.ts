import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_BASE_URL || 'https://top-newsss-project.vercel.app';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setSubscribed(!!sub);
        });
      }).catch(() => {});
    }
  }, []);

  const subscribe = async () => {
    if (!supported) {
      toast.error('આ બ્રાઉઝર Push Notification સપોર્ટ નથી કરતું.');
      return;
    }

    setLoading(true);
    try {
      // 1. Request permission FIRST to maintain user gesture context
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'denied') {
        toast.error('❌ Notification Blocked છે! બ્રાઉઝર ની ઉપર 🔒 Lock આઈકન પર ક્લિક કરી Allow સેલેક્ટ કરો.');
        setLoading(false);
        return;
      }

      if (perm !== 'granted') {
        setLoading(false);
        return;
      }

      // 2. Fetch VAPID key
      const keyRes = await fetch(`${API}/notifications/vapid-public`);
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        throw new Error('Backend VAPID public key not found');
      }

      // 3. Register service worker
      const reg = await navigator.serviceWorker.register('/push-sw.js');
      await navigator.serviceWorker.ready;

      // 4. Subscribe with PushManager
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 5. Send subscription to backend
      const subJSON = sub.toJSON();
      const saveRes = await fetch(`${API}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: subJSON.keys,
          language: navigator.language.slice(0, 2) || 'en',
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save subscription to server');
      }

      setSubscribed(true);
      toast.success('🎉 Push Notifications સબસ્ક્રાઇબ થઈ ગયું છે!');
    } catch (err: any) {
      console.error('Push subscription error:', err);
      toast.error(err.message || 'Notification subscribe કરવામાં ભૂલ આવી.');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(`${API}/notifications/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.info('Notifications અનસબસ્ક્રાઇબ કરી દેવાયું છે.');
    } catch (err) {
      console.error('Unsubscribe error:', err);
      toast.error('Unsubscribe કરવામાં ભૂલ આવી.');
    } finally {
      setLoading(false);
    }
  };

  return { supported, permission, subscribed, loading, subscribe, unsubscribe };
}
