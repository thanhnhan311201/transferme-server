const createLogger = (namespace: string) => {
  return (message: string) => {
    console.log(`⚡️[${namespace.toUpperCase()}]: ${message}`);
  };
};

export const dbLogger = createLogger("DATABASE");
export const serverLogger = createLogger("SERVER");
export const socketLogger = createLogger("SOCKET");
export const errorLogger = createLogger("ERROR");
export const infoLogger = createLogger("INFO");
