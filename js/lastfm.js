const REFRESH_INTERVAL = 30000;
const DATA_URL = "/now-playing.json";

function getArtworkUrl(images) {
  if (!images || images.length === 0) return null;
  const large = images.find(
    img => img.size === "extralarge" || img.size === "large"
  );
  return large?.["#text"] || images[0]?.["#text"] || null;
}

function createTrackElement(track, isNowPlaying) {
  const div = document.createElement("div");
  div.className = `track ${isNowPlaying ? "now-playing" : ""}`;

  const artwork = track.image
    ? `<img src="${getArtworkUrl(track.image)}" alt="album art" />`
    : "";

  div.innerHTML = `
    ${artwork}
    <div class="track-info">
      <div class="track-name">${track.track}</div>
      <div class="track-artist">${track.artist}</div>
      ${isNowPlaying ? `<div class="np-badge">Now Playing</div>` : ""}
    </div>
  `;

  return div;
}

async function fetchRecentTracks() {
  const trackList = document.getElementById("lastfm-tracks");
  if (!trackList) return;

  try {
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error("Failed to fetch JSON");

    const data = await res.json();
    trackList.innerHTML = "";

    const tracks = Array.isArray(data) ? data : [data];

    tracks.forEach(track => {
      const el = createTrackElement(track, track.playing);
      trackList.appendChild(el);
    });

  } catch (err) {
    console.error("Last.fm error:", err);
    trackList.innerHTML =
      `<div class="error-message">Unable to load Last.fm data</div>`;
  }
}

fetchRecentTracks();
setInterval(fetchRecentTracks, REFRESH_INTERVAL);
