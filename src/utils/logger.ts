type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LoggerOptions {
  context?: string;
  error?: unknown;
}

const isDevelopment = process.env.NODE_ENV !== 'production';

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

function formatMessage(message: unknown, options: LoggerOptions = {}): string {
  const formattedMessage = formatError(message);
  let finalMessage = options.context ? `[${options.context}] ${formattedMessage}` : formattedMessage;
  
  if (options.error) {
    const errorDetails = formatError(options.error);
    finalMessage += ` - Details: ${errorDetails}`;
  }
  
  return finalMessage;
}

export const logger = {
  error(message: unknown, options: LoggerOptions = {}): void {
    if (!isDevelopment) return;
    // @ts-ignore
    console.error(formatMessage(message, options));
  },

  warn(message: unknown, options: LoggerOptions = {}): void {
    if (!isDevelopment) return;
    // @ts-ignore
    console.warn(formatMessage(message, options));
  },

  info(message: unknown, options: LoggerOptions = {}): void {
    if (!isDevelopment) return;
    // @ts-ignore
    console.info(formatMessage(message, options));
  },

  debug(message: unknown, options: LoggerOptions = {}): void {
    if (!isDevelopment) return;
    // @ts-ignore
    console.debug(formatMessage(message, options));
  }
}; 