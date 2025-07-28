import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Send session reminders 30 minutes before scheduled sessions
crons.interval(
  'session-reminders',
  { minutes: 5 }, // Check every 5 minutes
  internal.functions.sendSessionReminders
);

// Send daily digest notifications
crons.daily(
  'daily-digest',
  { hourUTC: 9, minuteUTC: 0 }, // 9 AM UTC
  internal.functions.sendDailyDigest
);

export default crons;
