const config = {
  password: process.env.FB_PW || "",
  ip: process.env.FB_IP || "192.168.178.1",
  cooldownMin: parseInt(process.env.FB_COOLDOWN_MIN || "3")
};

export default config;
