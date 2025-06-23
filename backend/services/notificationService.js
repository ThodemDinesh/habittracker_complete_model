// Simple browser notification service
class NotificationService {
  constructor() {
    this.permission = 'default';
    this.checkPermission();
  }

  // Check current permission status
  checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  // Request permission for notifications
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === 'granted';
  }

  // Send morning motivation notification
  sendMorningNotification(totalHabits) {
    if (this.permission !== 'granted') return;

    const motivationalMessages = [
      "🌅 Good morning! Ready to build great habits?",
      "💪 New day, new opportunities to grow!",
      "🎯 Let's make today count with your habits!",
      "🌟 Start your day strong with positive habits!",
      "🚀 Time to level up with your daily habits!"
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    new Notification('Good Morning! 🌅', {
      body: `${randomMessage}\n\nYou have ${totalHabits} habits to complete today.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'morning-reminder',
      requireInteraction: false,
      silent: false
    });
  }

  // Send evening reminder notification
  sendEveningNotification(completedHabits, pendingHabits) {
    if (this.permission !== 'granted') return;

    let title, body;

    if (pendingHabits.length === 0) {
      title = '🏆 Perfect Day!';
      body = `Amazing! You completed all ${completedHabits} habits today! 🎉`;
    } else if (completedHabits > 0) {
      title = '⏰ Evening Check-in';
      body = `Great progress! ${completedHabits} done, ${pendingHabits.length} habits left to complete.`;
    } else {
      title = '💪 Still Time!';
      body = `You have ${pendingHabits.length} habits waiting. Even one completion makes a difference!`;
    }

    new Notification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'evening-reminder',
      requireInteraction: true,
      silent: false
    });
  }

  // Send custom notification
  sendCustomNotification(title, message, options = {}) {
    if (this.permission !== 'granted') return;

    new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
