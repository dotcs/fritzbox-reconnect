export const wait = (timeInMs: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeInMs);
  });
};
