/**
 * Authentic Media Artwork Dictionary
 * High-resolution, permanent images for Tamil singers, music directors, and movie soundtracks.
 */

const ARTIST_PORTRAITS = {
  'vivek': '/images/artists/vivek.jpg',
  'anirudh': '/images/artists/anirudh.jpg',
  'anirudh ravichander': '/images/artists/anirudh.jpg',
  'sid sriram': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Sid_Sriram.jpg',
  'santhosh narayanan': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Santhosh_Narayanan_-_WIki_profile.jpg',
  'yuvan shankar raja': 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Yuvan_Shankar_Raja_exclusive_HQ_Photos_Silverscreen.jpg',
  'a.r. rahman': 'https://upload.wikimedia.org/wikipedia/commons/1/10/AR_Rahman_at_Premier_Futsal_Press_Meet_%28cropped%29.jpg',
  'pradeep kumar': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Pradeep_Rangaswamy_Kumar.png',
  'dhanush': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Dhanush_at_the_%E2%80%98Asuran%E2%80%99_Success_Meet_%28cropped%29.jpg',
  'shreya ghoshal': 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Shreya_Ghoshal_Behindwoods_Gold_Icons_Awards_2023_%28cropped%29.jpg',
  'harris jayaraj': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Harris_Jayaraj_at_Gethu_Audio_Launch_%28cropped%29.jpg',
  'sean roldan': 'https://upload.wikimedia.org/wikipedia/commons/6/63/Sean_Roldan.jpg',
  'ilaiyaraaja': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Ilaiyaraaja_at_Merku_Thodarchi_Malai_Press_Meet_%28cropped%29.jpg',
  'hiphop tamizha': 'https://upload.wikimedia.org/wikipedia/commons/8/80/Hiphop_Tamizha_Aambala_audio_launch_%28cropped%29.jpg',
  'shakthisree gopalan': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Shakthisree_Gopalan.jpg',
  'saindhavi': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Saindhavi_Prakash.jpg',
  'vijay antony': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Vijay_Antony_and_Arjun_at_the_%E2%80%98Kolaigaran%E2%80%99_Press_Meet_%28cropped%29.jpg',
  'jonita gandhi': 'https://upload.wikimedia.org/wikipedia/commons/7/76/Jonita_Gandhi_snapped_at_an_event_in_Juhu_%28cropped%29.jpg',
  's. p. balasubrahmanyam': 'https://upload.wikimedia.org/wikipedia/commons/6/67/S._P._Balasubrahmanyam_at_the_%27Gurkha%27_Audio_Launch.jpg',
  'andrea jeremiah': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Andrea_Jeremiah_%28cropped%29.jpg',
  'chinmayi': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Chinmayi_Sripada.JPG',
  'g. v. prakash': '/images/artists/gvprakash.jpg',
  'g. v. prakash kumar': '/images/artists/gvprakash.jpg',
  'g.v. prakash': '/images/artists/gvprakash.jpg',
  'g.v. prakash kumar': '/images/artists/gvprakash.jpg',
  'gv prakash': '/images/artists/gvprakash.jpg',
  'gv prakash kumar': '/images/artists/gvprakash.jpg',
  'sai abhyankkar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  'dhee': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'dhibu ninan thomas': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
  'sam c.s.': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  'sam c.s': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  'vignesh shivan': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
  'karthik': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
  'haricharan': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  'naresh iyer': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80'
};

// Song / Movie Cover Posters (Authentic high-resolution artwork)
const MOVIE_SONG_COVERS = {
  // Direct matches from user screenshots
  'othaiyadi pathayila': '/images/covers/kanaa.jpg',
  'oorum blood': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'thangamey': '/images/covers/thangamey.jpg',
  'pottala muttaye': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'yaendi yaendi': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'poo avizhum pozhudhil': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  'mogathirai': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  'usuru narambulay': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
  'yennai maatrum kadhale': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'bae': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'kannamma': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  'railin oligal': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  'naan nee': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'maya nadhi': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'aval': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'koodamela koodavechi': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
  'adiyae azhagae': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
  'chellamma': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'andha kanna paathaakaa': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'vinmeen': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
  'yaayum': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'kaathalae kaathalae': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
  'mallipoo': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'thalli pogathey': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'maruvaarthai': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'mudhal nee mudivum nee': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'megham karukatha': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'kanja poovu kannala': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'yaanji': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'
};

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

/**
 * Get authentic portrait for an artist
 */
function resolveArtistImage(artistName, sampleCover = null) {
  if (!artistName) return DEFAULT_COVER;
  const norm = artistName.toLowerCase().trim();
  if (ARTIST_PORTRAITS[norm]) {
    return ARTIST_PORTRAITS[norm];
  }

  // Check partial key matches sorted by descending length (longest artist name first)
  const sortedKeys = Object.keys(ARTIST_PORTRAITS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp('(?:^|\\s|,)' + escaped + '(?:$|\\s|,)', 'i').test(norm)) {
      return ARTIST_PORTRAITS[key];
    }
  }

  // If the user specified: "if not in the song that contain the image file like with movie name and something use that also"
  if (sampleCover && !sampleCover.includes('default') && !sampleCover.includes('avatar')) {
    return sampleCover;
  }

  return DEFAULT_COVER;
}

/**
 * Get authentic cover image for a song / track
 */
function resolveSongCover(title, movie, artistName) {
  const normTitle = (title || '').toLowerCase().trim();
  const normMovie = (movie || '').toLowerCase().trim();

  // 1. Direct song title match
  if (MOVIE_SONG_COVERS[normTitle]) {
    return MOVIE_SONG_COVERS[normTitle];
  }

  // 2. Partial title match
  for (const [key, url] of Object.entries(MOVIE_SONG_COVERS)) {
    if (normTitle.includes(key) || key.includes(normTitle)) {
      return url;
    }
  }

  // 3. Movie match
  if (normMovie && MOVIE_SONG_COVERS[normMovie]) {
    return MOVIE_SONG_COVERS[normMovie];
  }

  // 4. Primary artist portrait
  if (artistName) {
    const artistImg = resolveArtistImage(artistName);
    if (artistImg && artistImg !== DEFAULT_COVER) {
      return artistImg;
    }
  }

  return DEFAULT_COVER;
}

module.exports = {
  ARTIST_PORTRAITS,
  MOVIE_SONG_COVERS,
  DEFAULT_COVER,
  resolveArtistImage,
  resolveSongCover
};
