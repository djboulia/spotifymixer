"use server";

import SpotifyWebApi from "spotify-web-api-node";
import { getSpotifyServerSession } from "~/util/auth/spotifyauth";
import { PlayList } from "~/util/playlist";
import type { Playlist } from "~/models/playlist";
import { ShuffleState } from "~/util/shufflestate";
import type { ShuffProgressStatus } from "~/models/shuffle";
import type { ShuffleProgress } from "~/util/shuffleprogress";
import { logger } from "~/util/logger";
import { RadioSync } from "~/util/radiosync";

const shuffleState = new ShuffleState();

export async function getOwnedPlayLists(): Promise<Playlist[]> {
  const session = await getSpotifyServerSession();
  if (!session?.accessToken) {
    throw new Error("Unauthorized access");
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(session.accessToken);

  const playlist = new PlayList(spotifyApi);
  const items = await playlist.getOwnedPlayLists();

  // go through the play list and extract what we want
  const list = [];

  for (const item of items) {
    // console.log("tracks: ", item.tracks);
    // console.log("images: ", item.images);
    console.log(item.name);

    list.push({
      id: item.id,
      name: item.name,
      img: item.images?.length > 0 ? item.images[0]?.url : "",
      total: item.tracks.total,
    });
  }

  return list;
}

export async function shuffleProgress(): Promise<ShuffProgressStatus> {
  const session = await getSpotifyServerSession();
  if (!session?.accessToken) {
    throw new Error("Unauthorized access");
  }

  let shuffleProgress = shuffleState.get(session.accessToken);

  if (!shuffleProgress) {
    console.log("No shuffle in progress, creating new shuffle state");

    shuffleProgress = shuffleState.add(session.accessToken);
  }

  return shuffleProgress.status();
}

async function spotifyShuffleItems(
  spotifyApi: SpotifyWebApi,
  shuffleProgress: ShuffleProgress,
  playlistIds: string[],
) {
  const length = playlistIds.length;
  for (let i = 0; i < length; i++) {
    const playListId = playlistIds[i];
    if (!playListId) {
      logger.error("Invalid playlist id, skipping...");
      continue;
    }

    // restart progress for each playlist
    shuffleProgress.start();
    shuffleProgress.setMultiple(i + 1, length);

    await shuffleProgress.shufflePlayList(spotifyApi, playListId);
  }

  // we are only complete when all playlists are done
  shuffleProgress.complete();
}

export async function shufflePlaylists(
  playListIds: string[],
): Promise<ShuffProgressStatus> {
  const session = await getSpotifyServerSession();
  if (!session?.accessToken) {
    throw new Error("Unauthorized access");
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(session.accessToken);

  console.log("playLists: ", playListIds);

  const shuffleProgress = shuffleState.add(session.accessToken);

  // kick off a shuffle of multiple playlists... this will take a while, so we
  // return immediately and the caller can check the state
  // via the /progress api
  void spotifyShuffleItems(spotifyApi, shuffleProgress, playListIds);

  return shuffleProgress.status();
}

export async function radioSync(
  stationId: string,
  playListId: string,
  numTracks: number,
) {
  const session = await getSpotifyServerSession();
  if (!session?.accessToken) {
    throw new Error("Unauthorized access");
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(session.accessToken);

  const radioSync = new RadioSync(spotifyApi);
  const results = await radioSync.sync(stationId, playListId, numTracks);

  return results;
}
