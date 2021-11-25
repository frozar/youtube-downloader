const express = require("express");
const app = express();
const fs = require("fs");
const ytdl = require("ytdl-core");

function isYoutubeURL(url) {
  return /^http[s]{0,1}:\/\/www.youtube.com|^http[s]{0,1}:\/\/youtu.be/.test(
    url
  );
}

async function getYoutubeInfo(req, res) {
  const youtubeUrl = req.query.q;
  if (!isYoutubeURL(youtubeUrl)) {
    res.send("Query parameter is not a youtube URL");
    return;
  }
  // const youtubeURL = "http://www.youtube.com/watch?v=" + youtubeId;
  const info = await ytdl.getInfo(youtubeUrl);
  return info;
}

// function snakeCasefy(str: String) {
function snakeCasefy(str: string) {
  return str.replace(/ /g, "_");
}

// -----URL: "/"-----
// Documentation link:
// https://tyrrrz.me/blog/reverse-engineering-youtube
app.get("/", async (req, res) => {
  const info = await getYoutubeInfo(req, res);
  const videoTitle = info.player_response.videoDetails.title;
  // console.log("info", info);
  // console.log(
  //   "info.player_response.videoDetails.title " +
  //     info.player_response.videoDetails.title
  // );
  const videoTitleSnakeCased = snakeCasefy(videoTitle) + ".mp3";
  if (!info) {
    return;
  }

  const fileName = req.query.f ? req.query.f : videoTitleSnakeCased;
  // console.log("req.query " + JSON.stringify(req.query));
  // console.log("req.query.f " + req.query.f);
  console.log("fileName " + fileName);

  await ytdl
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
