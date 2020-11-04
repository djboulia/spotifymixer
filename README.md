# SpotifyMixer React App

Radio mix of Spotify playlists

## How to use

```
npm start

```

Starts the backend server on localhost:8888 for testing. Use with the dev server in client_src for testing front end.

## Goals for this app:

I have lots of large playlists.  The normal shuffle function in Spotify has lots of issues documented all around the internet.  But the net is, I am always hearing the same songs and often hearing the same artist 
back to back.  If you were listening to the radio and an Elton John song came on, would you hear an Elton John song immediately afterwards?  Would you expect to hear the same Elton John song within the next hour?  You would not, but both scenarios happen more often than you'd think with the standard shuffle.

So here are the basic rules I came up with:
- Wouldn’t hear the same artist close together
- Wouldn’t hear the same titled song by two diff artists close together
- Random within an artist or version of a song, but spaced roughly evenly throughout playlist

## Approach
- The order of the artists based on most to least songs by the same artist, ending with all songs in the playlist where an artist only appears once.
- The order of the songs by the same artist is random
- The frequency of each artist through playlist is not random

## Algorithm

- Go get the song list from a given playlist
- Figure out number of artists, songs per artist to calculate distribution.
- Randomize the artist’s songs
- Establish artist order by number of songs per artist.
- Look for like-named songs across artists.  Swap appropriately to keep them apart
- Layout the new playlist

