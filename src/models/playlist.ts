export type Playlist = {
  id: string;
  name: string;
  img?: string;
  total: number;
};

export type PlayListDetails = {
  name: string | undefined;
  img: string | undefined;
};

export type SpotifyTrackWithSearch = SpotifyApi.TrackObjectFull & {
  searchTitle: string;
  searchArtist: string;
};
