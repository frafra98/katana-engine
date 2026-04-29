export const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

/**
 * Log messages with an automatic filename and an optional custom prefix.
 *
 * @param {string} customMessage - An optional message to add context.
 * @param {...any} messages - The messages to log.
 */
export const logDebug = (...messages: any[]) => {
  if (isDebugMode) {
    const stack = new Error().stack;
    const callerFile = stack?.split('\n')[2].trim();

    if (!callerFile) return;
    const filenameMatch = callerFile.match(/\/([^\/]+\.ts|js)/);

    const filename = filenameMatch ? filenameMatch[1] : 'unknown source';

     // ANSI escape code for green text
     const green = '\x1b[32m';
     const reset = '\x1b[0m';
 
     console.log(`${green}[${filename}]${reset} `, ...messages);
  }
};
