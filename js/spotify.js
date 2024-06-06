const spotifyClientId = 'be3a400cddb34042a263f47b499bdc4c';
const spotifyClientSecret = 'ad428ce3210542e89a3249e0ea3f18f4';


async function getSpotifyAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(spotifyClientId + ':' + spotifyClientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

async function fetchSpotifyPlaylists(weatherCondition) {
  const token = await getSpotifyAccessToken();
  const response = await fetch(`https://api.spotify.com/v1/search?q=${weatherCondition}&type=playlist`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });

  const data = await response.json();
  return data.playlists.items;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

async function displayPlaylists(weatherCondition) {
  try {
    const playlists = await fetchSpotifyPlaylists(weatherCondition);

    const shuffledPlaylists = shuffleArray(playlists);

    const playlistSquares = document.querySelectorAll('.playlist-square');

    playlists.slice(0, playlistSquares.length).forEach((playlist, index) => {
      const playlistSquare = playlistSquares[index];
      playlistSquare.innerHTML = `
        <a href="${playlist.external_urls.spotify}" target="_blank">
          <img src="${playlist.images[0]?.url || 'default_playlist_image_url'}" alt="${playlist.name}" />
          <p>${playlist.name}</p>
        </a>
      `;
    });
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
  }
}
export { displayPlaylists };
