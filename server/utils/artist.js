const normalizeArtist = (artist) => {
  let normalizedArtist = artist.toLowerCase().trim();

  // map e with accents to e without accents
  // e.g. Beyoncé vs. Beyonce, Cèline Dion vs. Celine Dion
  normalizedArtist = normalizedArtist
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/ë/g, 'e');

  // remove any apostrophies, commas, and periods
  normalizedArtist = normalizedArtist.replace(/[’',.]/g, '').trim();

  // translate & to "and" for better matching
  return normalizedArtist.replace(/&/g, 'and').replace(/ +/g, ' ').trim();
};

/**
 * Deal with artist names that may have different formats, e.g. The Beatles vs. Beatles.
 * Bob Seger vs. Bob Seger & The Silver Bullet Band.
 *
 * @param {string} artist1
 * @param {string} artist2
 * @returns true if the two artists are the same, false otherwise
 */
const sameArtist = (artist1, artist2) => {
  const normalizedArtist1 = normalizeArtist(artist1);
  const normalizedArtist2 = normalizeArtist(artist2);

  if (normalizedArtist1 === normalizedArtist2) return true;

  if (normalizedArtist1.includes(normalizedArtist2)) {
    // e.g. "The Beatles" includes "Beatles"
    console.log(
      `Artist match: ${normalizedArtist1} includes ${normalizedArtist2} (original: ${artist1}, ${artist2})`,
    );
    return true;
  }

  // compare the other way around
  if (normalizedArtist2.includes(normalizedArtist1)) {
    // e.g. "Beatles" includes "The Beatles"
    console.log(
      `Artist match: ${normalizedArtist2} includes ${normalizedArtist1} (original: ${artist1}, ${artist2})`,
    );
    return true;
  }

  return false;
};

/**
 * Check if an artist is in a list of artists
 *
 * @param {Array} artistList
 * @param {string} artist
 * @returns true if the artist is in the list
 */
const sameArtistInList = (artistList, artist) => {
  return artistList.some((a) => sameArtist(a, artist));
};

module.exports = {
  sameArtist,
  sameArtistInList,
};
