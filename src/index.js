const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const differenceInMinutes = require("date-fns/difference_in_minutes");

const logger = require("./logger");
const { wait } = require("./utils");
const config = require("./config");

const root = path.resolve(__dirname, "..");
const cooldownFp = path.join(root, "config", "cooldown.json");

if (!config.password) {
  logger.error(
    "No password has been set, but it is requried to log into the" +
      "webinterface. Abort."
  );
  exit(1);
}

(async () => {
  try {
    if (fs.existsSync(cooldownFp)) {
      const content = JSON.parse(fs.readFileSync(cooldownFp));
      const diff = differenceInMinutes(
        new Date(),
        content.timestampLastRestart
      );
      if (diff < config.cooldownMin) {
        logger.info("Cooldown is active. Nothing to do.");

        await wait(100);
        process.exit(0);
      }
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setViewport({ width: 1600, height: 1800 });
    page.setDefaultNavigationTimeout(10000);

    await page.goto(`http://${config.ip}/?lp=netMoni`, {
      waitUntil: "networkidle2"
    });

    await page.type("#uiPass", config.password);
    await page.click("#submitLoginBtn");
    await page.waitFor("#ipv4_led");

    const connection = await page.evaluate(() => {
      const ipv4Online =
        document.getElementById("ipv4_led").innerHTML.indexOf("led_green") > -1;
      const ipv6Online =
        document.getElementById("ipv6_led").innerHTML.indexOf("led_green") > -1;

      return { ipv4: ipv4Online, ipv6: ipv6Online };
    });

    if (!connection.ipv4 || !connection.ipv6) {
      logger.info("Fritz!Box is offline. Try to restart.");

      await page.click("#sys");
      await page.click("#mSave");
      await page.click("#reboot");
      await page.waitForSelector("#btn_form_foot");

      await wait(1000);
      const timestampLastRestart = new Date().toISOString();
      fs.writeFileSync(cooldownFp, JSON.stringify({ timestampLastRestart }));
      await page.click("#btn_form_foot button");
      await wait(1000);
      logger.info("Restart now");
    } else {
      // Nothing to do
      logger.info("Fritz!Box is online. Nothing to do.");
    }

    // await page.screenshot({ path: "example.png" });

    await browser.close();
  } catch (err) {
    logger.error(err);
    wait(100);
    process.exit(1);
  }
})();
