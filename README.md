# Setup

```shell
npm i
npm start
```

The `npm start` launch a web server. To use this web server, use another terminal window.

# Usage

To download a song from youtube:

```shell
curl localhost:8080?q=-otqHW9iQug
curl "localhost:8080?q=-otqHW9iQug&fileName=downloaded_song.mp4"
```

To send a song over the network (to a client web site for example):

```shell
curl localhost:8080/network?q=-otqHW9iQug
```
