/**
 * Normalize the track title by removing extraneous information,
 * such as (Remastered 2020), [Remastered], - Remastered, (feat. Artist), etc.
 * and converting to lowercase.
 *
 * @param {string} title - the original track title
 * @returns {string} - the normalized track title
 */
const normalizeTitle = (title) => {
  let newTitle = title;

  // regex to get the contents of the last pair of parentheses in the track name
  const parensMatch = newTitle.match(/\(([^)]+)\)$/);
  if (parensMatch) {
    newTitle = newTitle.replace(/\(([^)]+)\)$/, '').trim();
    // console.log('Removing parentheses from track name to ' + newTitle + ' from ' + title);
  }

  // regex to get the contents after the last hyphen in the track name
  const hyphenMatch = newTitle.match(/-(.*)$/);
  if (hyphenMatch) {
    newTitle = newTitle.replace(/-(.*)$/, '').trim();
    // console.log('Removing hyphen from track name to ' + newTitle + ' from ' + title);
  }

  const bracketsMatch = newTitle.match(/\[(.*?)\]/);
  if (bracketsMatch) {
    newTitle = newTitle.replace(/\[(.*?)\]/, '').trim();
    // console.log('Removing brackets from track name to ' + newTitle + ' from ' + title);
  }

  // remove apostrophes and commas
  newTitle = newTitle.replace(/['",]/g, '').trim();

  return newTitle.toLowerCase();
};

const sameTitle = (title1, title2) => {
  const normalizedTitle1 = normalizeTitle(title1);
  const normalizedTitle2 = normalizeTitle(title2);

  return normalizedTitle1 === normalizedTitle2;
};

module.exports = {
  sameTitle,
};
