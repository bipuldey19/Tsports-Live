const axios = require("axios");
const express = require("express");
const request = require("request");

const app = express();

app.get("/tsports1", async (req, res) => {
  res.sendFile(__dirname + "/tsports1.html");
});

app.get("/tsports2", async (req, res) => {
  res.sendFile(__dirname + "/tsports2.html");
});

const forwardRequest = async (url, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/byte-capsule/TSports-m3u8-Grabber/main/TSports_m3u8_headers.Json"
  );
  let TsportsCookie = data.channels[1].headers.Cookie;
  request
    .get({
      url,
      headers: {
        Cookie: TsportsCookie,
        Host: "live-cdn.tsports.com",
        "User-agent": "https://github.com/byte-capsule (Linux;Android 14)",
      },
    })
    .pipe(res);
};

app.get("/:channel", async (req, res) => {
  const mainUrl = req.headers.referer || "";
  const livePart = mainUrl.includes("tsports1") ? "live-01" : "live-02";

  const channel = req.params.channel;
  if (channel.endsWith(".m3u8")) {
    // Set up a route to handle multi-bitrate m3u8 file
    return forwardRequest(
      `https://live-cdn.tsports.com/${livePart}/${channel}`,
      res
    );
  } else {
    // Set up a route to handle main m3u8 file
    const streamUrl = `https://live-cdn.tsports.com/${channel}/index.m3u8`;
    return forwardRequest(streamUrl, res);
  }
});

// Set up a route to handle ts files
app.get("/:channel/:filename", (req, res) => {
  const mainUrl = req.headers.referer || "";
  const livePart = mainUrl.includes("tsports1") ? "live-01" : "live-02";

  const channel = req.params.channel;
  const filename = req.params.filename;
  const m3u8Url = `https://live-cdn.tsports.com/${livePart}/${channel}/${filename}`;

  forwardRequest(m3u8Url, res);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000.");
});