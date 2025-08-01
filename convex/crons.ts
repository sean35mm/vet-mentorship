import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Send session reminders 30 minutes before scheduled sessions
crons.interval(
  'session-reminders',
  { minutes: 5 }, // Check every 5 minutes
  internal.functions.sendSessionReminders,
  {}
);

// Send daily digest notifications
crons.cron(
  'daily-digest',
  '0 9 * * *', // 9 AM UTC daily (minute hour day month dayOfWeek)
  internal.functions.sendDailyDigest,
  {}
);

export default crons;
