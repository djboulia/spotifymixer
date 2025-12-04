/**
 * Normalize the track title by removing extraneous information,
 * such as (Remastered 2020), [Remastered], - Remastered, (feat. Artist), etc.
 * and converting to lowercase.
 *
 * @param {string} title - the original track title
 * @returns {string} - the normalized track title
 */
export const normalizeTitle = (title: string) => {
  let newTitle = title;

  // regex to get the contents of the last pair of parentheses in the track name
  const parensMatch = /\(([^)]+)\)$/.exec(newTitle);
  if (parensMatch) {
    newTitle = newTitle.replace(/\(([^)]+)\)$/, "").trim();
    // console.log('Removing parentheses from track name to ' + newTitle + ' from ' + title);
  }

  // regex to get the contents after the last hyphen in the track name
  const hyphenMatch = /-(.*)$/.exec(newTitle);
  if (hyphenMatch) {
    newTitle = newTitle.replace(/-(.*)$/, "").trim();
    // console.log('Removing hyphen from track name to ' + newTitle + ' from ' + title);
  }

  const bracketsMatch = /\[(.*?)\]/.exec(newTitle);
  if (bracketsMatch) {
    newTitle = newTitle.replace(/\[(.*?)\]/, "").trim();
    // console.log('Removing brackets from track name to ' + newTitle + ' from ' + title);
  }

  // remove apostrophes and commas, single quotes, and double quotes
  newTitle = newTitle.replace(/[’'",]/g, "").trim();

  return newTitle.toLowerCase();
};

export const sameTitle = (title1: string, title2: string) => {
  const normalizedTitle1 = normalizeTitle(title1);
  const normalizedTitle2 = normalizeTitle(title2);

  return normalizedTitle1 === normalizedTitle2;
};
