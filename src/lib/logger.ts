interface Logger {
  log: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
}

const logger: Logger = {
  log: (message) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
    }
  },

  error: (message) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    }
  },

  warn: (message) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    }
  },
};

export default logger;
