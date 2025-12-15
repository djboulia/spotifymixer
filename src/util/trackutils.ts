/**
 * helper functions for working with track lists.
 */
const swapTracks = function (
  tracks: SpotifyApi.PlaylistTrackObject[],
  i: number,
  j: number,
) {
  const track1 = tracks[i];
  const track2 = tracks[j];

  if (!track1 || !track2) {
    console.error("swapTrack called with invalid indices!");
    return;
  }

  tracks[i] = track2;
  tracks[j] = track1;
};
/**
 * randomly shuffles a set of tracks
 */
export function shuffle(
  tracks: SpotifyApi.PlaylistTrackObject[],
): SpotifyApi.PlaylistTrackObject[] {
  let currentIndex = tracks.length;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    swapTracks(tracks, currentIndex, randomIndex);
  }

  return tracks;
}

export function printTrack(
  title: string,
  track: SpotifyApi.PlaylistTrackObject | undefined,
) {
  if (track) {
    const artists = track.track?.artists;
    const name = track.track?.name;
    const id = track.track?.id;

    console.log(`${title} ${name} [${artists?.[0]?.name}], id = ${id}`);
  } else {
    console.log(title + " undefined!");
  }
}

export function printTracks(
  tracks: SpotifyApi.PlaylistTrackObject[] | undefined,
) {
  if (!tracks) {
    console.log("No tracks to print.");
    return;
  }

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];

    printTrack(`Track: ${i}`, track);
  }
}

export function identicalTrackLists(
  tracks1: SpotifyApi.PlaylistTrackObject[],
  tracks2: SpotifyApi.PlaylistTrackObject[],
): boolean {
  if (tracks1.length != tracks2.length) {
    console.log(
      "Track list lengths aren't the same: " +
        tracks1.length +
        ", " +
        tracks2.length,
    );
    return false;
  }

  for (let i = 0; i < tracks1.length; i++) {
    const track1 = tracks1[i];
    const track2 = tracks2[i];

    if (track1 && track2) {
      const name1 = track1.track?.name;
      const id1 = track1.track?.id;

      const name2 = track2.track?.name;
      const id2 = track2.track?.id;

      if (id1 != id2) {
        console.log("Track index " + i + " differs: " + name1 + " != " + name2);
        return false;
      }
    } else if (track1) {
      const name1 = track1.track?.name;

      console.log("Track index: " + i + " differs: " + name1 + " != undefined");
      return false;
    } else if (track2) {
      const name2 = track2.track?.name;

      console.log("Track index: " + i + " differs: undefined != " + name2);
      return false;
    } else {
      console.log("Track index: " + i + " both tracks undefined!");
      return false;
    }
  }

  return true;
}

export function findTrackIndex(
  track: SpotifyApi.PlaylistTrackObject,
  tracks: SpotifyApi.PlaylistTrackObject[],
): number {
  for (let i = 0; i < tracks.length; i++) {
    const current = tracks[i];
    if (current?.track?.id === track.track?.id) {
      return i;
    }
  }

  console.log("ERROR! couldn't find track id!");
  return -1;
}

export function moveTrack(
  tracks: SpotifyApi.PlaylistTrackObject[],
  from: number,
  to: number,
) {
  const [movedTrack] = tracks.splice(from, 1);
  if (movedTrack) {
    tracks.splice(to, 0, movedTrack);
  }
}
