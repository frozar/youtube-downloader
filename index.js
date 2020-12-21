const express = require("express");
const app = express();
const fs = require("fs");
const ytdl = require("ytdl-core");

async function getYoutubeInfo(req, res) {
  const youtubeId = req.query.q;
  if (!youtubeId) {
    res.send("Cannot find youtubeId");
    return;
  }
  const youtubeURL = "http://www.youtube.com/watch?v=" + youtubeId;
  const info = await ytdl.getInfo(youtubeURL);
  return info;
}

// -----URL: "/"-----
// Documentation link:
// https://tyrrrz.me/blog/reverse-engineering-youtube
app.get("/", async (req, res) => {
  const info = await getYoutubeInfo(req, res);
  if (!info) {
    return;
  }

  const fileName = req.query.fileName
    ? req.query.fileName
    : "download_music.mp4";

  ytdl
    .downloadFromInfo(info, {
      filter: (format) => format.itag === 140,
    })
    .pipe(fs.createWriteStream(fileName));
  res.send("File downloaded");
});

// -----URL: "/network"-----
app.get("/network", async (req, res) => {
  const info = await getYoutubeInfo(req, res);
  if (!info) {
    return;
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Send the sound file as a response over the network
  let stream = ytdl
    .downloadFromInfo(info, {
      filter: (format) => format.itag === 140,
    })
    .pipe(res);
  stream.on("end", res.end);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Let's download song from youtube:", port);
});
