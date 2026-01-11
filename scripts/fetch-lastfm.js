import fs from "fs";

const USER = "YOUR_LASTFM_USERNAME";
const KEY = process.env.LASTFM_API_KEY;

const url =
  `https://ws.audioscrobbler.com/2.0/` +
  `?method=user.getrecenttracks&user=${USER}` +
  `&api_key=${KEY}&format=json&limit=1`;

const res = await fetch(url);
const json = await res.json();
const track = json.recenttracks.track[0];

const output = {
  playing: track["@attr"]?.nowplaying === "true",
  artist: track.artist["#text"],
  track: track.name,
  album: track.album["#text"],
  image: track.image,
  updated: Date.now()
};

fs.writeFileSync("now-playing.json", JSON.stringify(output, null, 2));
