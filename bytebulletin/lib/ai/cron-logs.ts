// Global in-memory log buffer to stream Cron Job events to the Admin Dashboard in real-time
type CronLogMessage = {
  id: string;
  type: "info" | "process" | "success" | "error" | "wait";
  message: string;
  timestamp: number;
};

// Use globalThis to persist array across hot-reloads and API invocations in Node
const globalForCron = globalThis as unknown as {
  cronLogsBuffer: CronLogMessage[];
};

export const cronLogsBuffer = globalForCron.cronLogsBuffer || [];
if (process.env.NODE_ENV !== "production") globalForCron.cronLogsBuffer = cronLogsBuffer;

export function addCronLog(type: CronLogMessage["type"], message: string) {
  const log: CronLogMessage = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    message,
    timestamp: Date.now(),
  };

  cronLogsBuffer.push(log);

  // Keep only the latest 100 log messages in memory
  if (cronLogsBuffer.length > 100) {
    cronLogsBuffer.shift();
  }
}

export function getCronLogs(sinceTimestamp: number = 0) {
  return cronLogsBuffer.filter(log => log.timestamp > sinceTimestamp);
}
