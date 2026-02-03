import { IS_DEV } from "../config/env";

export const logDev = (...args: any[]) => {
  if (IS_DEV) {
    console.log(...args);
  }
};
