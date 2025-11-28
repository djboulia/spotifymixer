const PlayList = require('./playlist');
const TrackUtils = require('./trackutils');
const logger = require('./logger');
const { normalizeTitle } = require('./utils/title');

/**
 * This class implements the shuffle algorithm.  It sorts by artist first,
 * randomizes the songs for that artist, then lays out the tracks roughly
 * spaced out so that you don't hear the same artist back to back.  This
 * repeats with other artists in decreasing frequency.  Finally one hit wonders
 * are combined, randomized and used to fill in any gaps in the play list.
 *
 * @param {Object} spotifyApi a configured SpotifyApi with a valid access token
 */
const Mixer = function (spotifyApi) {
  this.snapshot_id = null;

  this.getPlayListDetails = function (playListId) {
    const playList = new PlayList(spotifyApi);
    return playList.getDetails(playListId);
  };

  this.getTracks = function (playListId) {
    const playList = new PlayList(spotifyApi);
    return playList.getTracks(playListId);
  };

  /**
   * takes an object where each property is a categoery and each
   * value is an array of tracks
   *
   * Sorts categories based on number of tracks and returns an array of the
   * sorted values.
   *
   * @param {Object} categories
   */
  const sortStats = function (categories) {
    const arrayStats = [];
    const singles = [];

    for (prop in categories) {
      if (categories[prop].tracks.length > 1) {
        logger.info('category ' + prop + ' has ' + categories[prop].tracks.length + ' songs');
        arrayStats.push({
          type: categories[prop].type,
          category: categories[prop].category,
          tracks: categories[prop].tracks,
        });
      } else {
        // combine single track artists
        singles.push(categories[prop].tracks[0]);
      }
    }

    arrayStats.sort(function (a, b) {
      if (a.tracks.length < b.tracks.length) {
        return 1;
      } else if (a.tracks.length > b.tracks.length) {
        return -1;
      } else {
        return 0;
      }
    });

    // shuffle and layout single artists last

    if (singles.length > 0) {
      TrackUtils.shuffle(singles);

      arrayStats.push({
        type: 'artist',
        category: '[singles]',
        tracks: singles,
      });
    }

    return arrayStats;
  };

  const getCategoriesTrackCount = function (categories) {
    let count = 0;
    for (const prop in categories) {
      count += categories[prop].tracks.length;
    }
    return count;
  };

  /**
   * Take the original track list and build arrays of "categories".  This could be any criteria, but for our
   * purposes, we are defining categories based on two criteria
   *
   * 1) duplicate song titles (remixes, live versions, covers by other artists, etc)
   * 2) artist name
   *
   * Each category will be an array of tracks that match that category.  The resulting categories will
   * then be sorted by size (number of tracks) so that we can lay them out in the playlist
   *
   * @param {Object} tracks array of spotify track objects
   * @returns
   */
  const sortByCategories = async function (tracks) {
    const self = this;

    const categories = {};
    const titles = {};
    const artists = [];

    // build a map keyed off song titles; this will catch duplicate track titles
    for (const track of tracks) {
      const title = normalizeTitle(track.track.name);
      const titleList = titles[title] ? titles[title] : [];
      titleList.push(track);
      titles[title] = titleList;
    }

    // add duplicate title tracks as categories, singles go into a separate array of artists
    for (const title of Object.keys(titles)) {
      const titleList = titles[title];
      if (titleList.length > 1) {
        logger.info('Found duplicate title "' + title + '" with ' + titleList.length + ' versions');
        const name = titleList[0].track.name; // get non normalized name for display
        categories[title] = {
          type: 'title',
          category: name,
          tracks: titleList,
        };
      } else {
        // put any single tracks into an artist list
        const track = titleList[0];
        artists.push(track);
      }
    }

    // go through artists and categorize tracks by the same artist
    logger.info('Found  ' + artists.length + ' non-duplicate title tracks in playlist');
    for (let i = 0; i < artists.length; i++) {
      const track = artists[i];

      // logger.info('Retrieved track name:', track.track.name);
      // logger.info('Retrieved track artist:', track.track.artists);

      const trackArtists = track.track.artists;
      if (trackArtists.length > 1) {
        logger.error(
          'Warning: more than one artist in this track. Using first one in this list: ',
          trackArtists,
        );
      }
      const artist = trackArtists[0].name;
      // logger.info('Found artist name:', artist);

      const tracklist = categories[artist]?.tracks ? categories[artist].tracks : [];
      tracklist.push(track);

      categories[artist] = {
        type: 'artist',
        category: artist,
        tracks: tracklist,
      };
    }

    // double check we ended up with the same total number of tracks after building categories
    const count = getCategoriesTrackCount(categories);
    if (count !== tracks.length) {
      logger.error('Error: track count mismatch!  Expected ' + tracks.length + ' but got ' + count);
      throw new Error('Track count mismatch!');
    }
    logger.info(
      'Categorized ' + count + ' tracks into ' + Object.keys(categories).length + ' categories',
    );

    const sortedCategories = sortStats(categories);
    return sortedCategories;
  };

  /**
   * we define a "frame" as the section of the playlist that this track
   * can fall into.  The frame size is calculated by dividing this artist's
   * number of tracks by the total playlist size.  This spaces out the
   * artist's songs across the playlist so that we avoid hearing the same
   * artist back to back.  So if there are 100 tracks total and this artist
   * has 10 songs in the playlist, then we have 10 "frames" where no more
   * than one of this artist's songs are placed.
   *
   * This walks the list looking for an open slot in
   * the frame. We take a random number as a starting point so that
   * tracks don't follow a strict pattern.  In the event we don't find
   * a spot within the frame, we insert this track and remove an empty
   * track somewhere else.
   *
   * @param {Array} list the list to place this track in
   * @param {Number} start index to start with
   * @param {Number} frameSize size of frame to search
   * @param {Object} track track to insert
   * @param {Number} rando random seed to start to lay out this track
   */
  const placeInFrame = function (list, start, frameSize, track, rando) {
    // first try to pick a random number in the back half of the frame
    logger.info('start ' + start + ', frameSize ' + frameSize + ', rando ' + rando);

    // walk back from this number to the start of the frame to find
    // first available slot
    for (let i = rando; i >= start; i--) {
      if (!list[i]) {
        list[i] = track;
        return list;
      }
    }

    // random didn't work, just try to find an empty slot
    // walk this frame looking for an empty spot
    for (let i = start; i < start + frameSize; i++) {
      if (!list[i]) {
        list[i] = track;
        return list;
      }
    }

    // if there are no spots left in frame, insert ourselves
    list.splice(rando, 0, track);

    // now go look for an open spot to delete
    for (let i = 0; i < list.length; i++) {
      if (!list[i]) {
        logger.debug('Inserting at ' + rando + ' and removing at ' + i + ' ', track.track.name);

        list.splice(i, 1);
        return list;
      }
    }

    return list;
  };

  /**
   * Seed this frame with a higher random number
   *
   * @param {Array} list the list to place this track in
   * @param {Number} start index to start with
   * @param {Number} frameSize size of frame to search
   * @param {Object} track track to insert
   */
  const placeHighInFrame = function (list, start, frameSize, track) {
    // first try to pick a random number in the back half of the frame
    const rando = start + (frameSize - Math.floor(Math.random() * Math.floor(frameSize / 2))) - 1;

    return placeInFrame(list, start, frameSize, track, rando);
  };

  /**
   * Seed this frame with a lower random number
   *
   * @param {Array} list the list to place this track in
   * @param {Number} start index to start with
   * @param {Number} frameSize size of frame to search
   * @param {Object} track track to insert
   */
  const placeLowInFrame = function (list, start, frameSize, track) {
    // first try to pick a random number in the first half of the frame
    const rando = Math.floor(Math.random() * Math.floor(frameSize / 2)) + start;

    return placeInFrame(list, start, frameSize, track, rando);
  };

  /**
   * This returns the "to be" playlist order as an array.
   *
   * @param {Array} sortedStats
   * @returns an array with the mixed playlist
   */
  const buildPlaylist = function (sortedStats) {
    // first figure out how big the track list is
    let total = 0;
    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];
      total += stat.tracks.length;
    }

    const mixList = new Array(total);

    let low = true;

    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];

      // shuffle the tracks for this artist so we get
      // a different order each time
      if (stat.tracks.length > 1) {
        TrackUtils.shuffle(stat.tracks);
      }

      let frameStart = 0;
      const frameSize = Math.floor(total / stat.tracks.length);
      let remainder = total % stat.tracks.length;

      // distribute the tracks for this artist throughout the frame
      for (let j = 0; j < stat.tracks.length; j++) {
        const track = stat.tracks[j];
        const currentFrameSize = remainder > 0 ? frameSize + 1 : frameSize;

        if (low) {
          placeLowInFrame(mixList, frameStart, currentFrameSize, track);
        } else {
          placeHighInFrame(mixList, frameStart, currentFrameSize, track);
        }

        frameStart += currentFrameSize;
        remainder--;
      }

      low = !low;
    }

    return mixList;
  };

  /**
   * catalog the tracks by artist so we can figure out how to lay out
   * a properly mixed playlist
   *
   * @param {Array} tracks array of tracks objects
   */
  this.getMixedTrackList = async function (playListId) {
    const self = this;
    logger.debug('mixtracks snapshot_id = ' + self.snapshot_id);

    const playList = new PlayList(spotifyApi);

    const trackList = await playList.getTracks(playListId).catch((err) => {
      throw err;
    });

    // save the snapshot state for this playList to avoid concurrent update issues
    logger.debug(`mixer.getTracks playListId ${playListId} snapshot_id : ${trackList.snapshot_id}`);
    self.snapshot_id = trackList.snapshot_id;
    const tracks = trackList.tracks;

    const sortedStats = await sortByCategories(tracks);

    // logger.info("sorted stats: ", sortedStats);

    const mixList = buildPlaylist(sortedStats);
    TrackUtils.printTracks(mixList);

    logger.info('Original track list: ');
    TrackUtils.printTracks(tracks);

    // summarize the sorted stats and return those
    const categoryStats = [];
    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];
      categoryStats.push({
        type: stat.type,
        category: stat.category,
        length: stat.tracks.length,
      });
    }

    return {
      before: tracks,
      after: mixList,
      categories: categoryStats,
    };
  };

  /**
   * reorder a track in the playlist
   *
   * @param {String} playListId spotify id for this playlist
   * @param {String} snapshotId returned from each call to Spotify; keeps in sync with spotify api
   * @param {Array} fromPlaylist starting playlist track order
   * @param {Array} toPlaylist desired playlist track order
   * @param {Number} trackIndex index of track in the toPlaylist to reorder
   * @returns snapshot_id this keeps calls to spotify api in sync
   */
  const reorderTrack = async function (
    playListId,
    snapshot_id,
    fromPlaylist,
    toPlaylist,
    trackIndex,
  ) {
    if (trackIndex < 0 || trackIndex >= toPlaylist.length) {
      throw new Error('trackIndex out of range');
    }

    // process the current track
    const track = toPlaylist[trackIndex];
    logger.debug('Position ' + trackIndex + '. Placing track ' + track.track.name);

    // find this track in the from list
    const index = TrackUtils.findTrackIndex(track, fromPlaylist);
    logger.debug('Found track ' + track.track.name + ' at ' + index);

    if (index < 0 || index >= fromPlaylist.length) {
      logger.error("Error: couldn't find track!");
      throw new Error("Couldn't find track!");
    }

    if (index !== trackIndex) {
      // do the move of the track to its new position
      const playList = new PlayList(spotifyApi);

      const body = await playList
        .reorderTrack(playListId, index, trackIndex, snapshot_id)
        .catch((err) => {
          throw err;
        });

      // store the returned snapshot_id for the next call
      snapshot_id = body.snapshot_id;

      // update the local from array to match
      TrackUtils.moveTrack(fromPlaylist, index, trackIndex);
      logger.debug('Moved track at ' + index + ' to before ' + trackIndex);
    } else {
      logger.debug('Got lucky! track already in order.  No action required. ', track.track.name);
    }

    return snapshot_id;
  };

  /**
   * reorder the play list
   *
   * @param {String} playListId
   * @param {Array} fromPlaylist original play list order
   * @param {Array} toPlaylist new playlist order
   * @param {Function} progressCallback (optional) callback function to update progress
   */
  this.reorderPlaylist = async function (playListId, fromPlaylist, toPlaylist, progressCallback) {
    for (let i = 0; i < toPlaylist.length; i++) {
      this.snapshot_id = await reorderTrack(
        playListId,
        this.snapshot_id,
        fromPlaylist,
        toPlaylist,
        i,
      ).catch((err) => {
        throw err;
      });

      if (progressCallback) {
        // if supplied, call the callback function to update progress
        progressCallback(i + 1, toPlaylist.length);
      }
    }

    logger.info('Final re-ordered track list: ');
    TrackUtils.printTracks(fromPlaylist);
  };
};

module.exports = Mixer;
