// Firebase Messaging Service Worker
// This file handles background push notifications

self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Top News', body: event.data.text() };
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Read More' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  const notifTitle = data.title && (data.title.includes('TOP NEWS') || data.title.includes('Top News'))
    ? data.title
    : `📰 TOP NEWS | ${data.title || 'Breaking News'}`;

  event.waitUntil(
    self.registration.showNotification(notifTitle, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
