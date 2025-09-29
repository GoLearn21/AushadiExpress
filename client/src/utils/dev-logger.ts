// Dev-only camera flow debugging logger - console only

export const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'development') return;
  console.log('[CAMERA]', ...args);
};

// Alias so existing push calls still work
export const push = log;

// Clear logs utility for testing
export const clearLogs = () => {
  if (process.env.NODE_ENV !== 'development') return;
  log('Logs cleared');
};