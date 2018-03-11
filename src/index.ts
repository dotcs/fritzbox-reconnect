import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import differenceInMinutes from "date-fns/difference_in_minutes";

import logger from "./logger";
import { wait } from "./utils";
import config from "./config";

const root = path.resolve(__dirname, "..");
const cooldownFp = path.join(root, "config", "cooldown.json");

(async () => {
  if (!config.password) {
    logger.error(
      "No password has been set, but it is requried to log into the" +
        "webinterface. Abort."
    );
    await wait(100); // give the logger some time flush
    process.exit(0);
  }

  try {
    if (fs.existsSync(cooldownFp)) {
      const content = JSON.parse(fs.readFileSync(cooldownFp).toString());
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
      const ipv4Node = document.getElementById("ipv4_led");
      const ipv4Online = !!ipv4Node
        ? ipv4Node.innerHTML.indexOf("led_green") > -1
        : false;
      const ipv6Node = document.getElementById("ipv6_led");
      const ipv6Online = !!ipv6Node
        ? ipv6Node.innerHTML.indexOf("led_green") > -1
        : false;

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
    await wait(100); // give the logger some time flush
    process.exit(1);
  }
})();
