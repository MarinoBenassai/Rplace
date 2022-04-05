import fetch from "node-fetch";
import puppeteer from "puppeteer";
import fs from "graceful-fs";
import { v4 as uuidv4 } from 'uuid';

async function download(add, id, id2) {
  const response = await fetch(add);
  const aBuffer = await response.arrayBuffer();
  fs.writeFile(`/home/zinc/Rplace/img/image${id}$-(${id2}).jpg`, Buffer.from(aBuffer), () => {});
}

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.reddit.com/r/place/");
  const cdp = await page.target().createCDPSession();
  await cdp.send("Network.enable");
  await cdp.send("Page.enable");
  var stream = fs.createWriteStream("/home/zinc/Rplace/log.txt", { flags: "a" });
  const printResponse = (response) => {
    const add = response.response.payloadData.match(
      /https:\/\/hot-potato.reddit.com\/media\/canvas-images\/.*.png/g
    );
    if (add) {
      const id2 = uuidv4();
      download(add, response.timestamp, id2);
      stream.write(
        response.response.payloadData + " " + response.timestamp + " " + id2 + "\n"
      );
    }
  };
  cdp.on("Network.webSocketFrameReceived", printResponse); // Fired when WebSocket message is received.
  cdp.on("Network.webSocketFrameSent", printResponse); // Fired when WebSocket message is sent.
}

run();
