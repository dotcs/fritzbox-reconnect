const wait = timeInMs => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeInMs);
  });
};

module.exports = { wait };
