import fetch from "node-fetch";
import puppeteer from "puppeteer";
import fs from "graceful-fs";

async function download(add, id) {
  const response = await fetch(add);
  const aBuffer = await response.arrayBuffer();
  fs.writeFile(`./img/image${id}.jpg`, Buffer.from(aBuffer), () => {});
}

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.reddit.com/r/place/");
  const cdp = await page.target().createCDPSession();
  await cdp.send("Network.enable");
  await cdp.send("Page.enable");
  var stream = fs.createWriteStream("log.txt", { flags: "a" });
  const printResponse = (response) => {
    const add = response.response.payloadData.match(
      /https:\/\/hot-potato.reddit.com\/media\/canvas-images\/.*.png/g
    );
    if (add) {
      download(add, response.timestamp);
      stream.write(
        response.response.payloadData + " " + response.timestamp + "\n"
      );
    }
  };
  cdp.on("Network.webSocketFrameReceived", printResponse); // Fired when WebSocket message is received.
  cdp.on("Network.webSocketFrameSent", printResponse); // Fired when WebSocket message is sent.
}

run();
