const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const REFRESH_INTERVAL = 30000;

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getArtworkUrl(images) {
  if (!images || images.length === 0) return null;
  const large = images.find(img => img.size === 'large' || img.size === 'extralarge');
  if (large && large['#text']) return large['#text'];
  const any = images.find(img => img['#text']);
  return any ? any['#text'] : null;
}

function createTrackElement(track, isNowPlaying) {
  const artwork = getArtworkUrl(track.image);
  const duration = track.duration ? formatDuration(parseInt(track.duration)) : '--:--';

  const div = document.createElement('div');
  div.className = `track${isNowPlaying ? ' playing' : ''}`;

  div.innerHTML = `
    <img
      src="${artwork || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"%3E%3Crect fill="%2316161f" width="56" height="56"/%3E%3Ctext x="28" y="32" text-anchor="middle" fill="%238888a0" font-size="12"%3E?%3C/text%3E%3C/svg%3E'}"
      alt="album art"
      class="track-artwork"
      onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 56 56%22%3E%3Crect fill=%22%2316161f%22 width=%2256%22 height=%2256%22/%3E%3Ctext x=%2228%22 y=%2232%22 text-anchor=%22middle%22 fill=%22%238888a0%22 font-size=%2212%22%3E?%3C/text%3E%3C/svg%3E'"
    >
    <div class="track-info">
      <div class="track-title">${track.name || 'unknown track'}</div>
      <div class="track-artist">${track.artist?.['#text'] || track.artist || 'unknown artist'}</div>
    </div>
    <div class="track-meta">
      <div class="track-duration">${duration}</div>
      ${isNowPlaying ? '<div class="track-status">playing now</div>' : ''}
    </div>
  `;

  return div;
}

async function fetchRecentTracks() {
  const trackList = document.getElementById('track-list');
  if (!trackList) return;

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/lastfm`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('failed to fetch');

    const data = await response.json();
    const tracks = data.recenttracks?.track;

    if (!tracks || tracks.length === 0) {
      trackList.innerHTML = '<div class="error-message">no recent tracks found.</div>';
      return;
    }

    trackList.innerHTML = '';

    tracks.forEach((track, index) => {
      const isNowPlaying = track['@attr']?.nowplaying === 'true';
      const trackElement = createTrackElement(track, isNowPlaying);
      trackList.appendChild(trackElement);
    });

  } catch (error) {
    console.error('lastfm error:', error);
    trackList.innerHTML = '<div class="error-message">unable to load tracks.</div>';
  }
}

fetchRecentTracks();
setInterval(fetchRecentTracks, REFRESH_INTERVAL);
