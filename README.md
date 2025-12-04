# Spotify Mixer

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.
It uses TypeScript, Next.js, React, and Tailwind CSS.

## Goals for this app:

I have lots of large playlists. The normal shuffle function in Spotify has lots of issues documented all around the internet. But the net is, I am always hearing the same songs and often hearing the same artist
back to back. If you were listening to the radio and an Elton John song came on, would you hear an Elton John song immediately afterwards? Would you expect to hear the same Elton John song within the next hour? You would not, but both scenarios happen more often than you'd think with the standard shuffle.

So here are the basic rules I came up with:

- Wouldn’t hear the same artist close together
- Wouldn’t hear the same titled songs (either covers of the same song by different artists, or duplicate songs by the same artist) close together
- Random within an artist or version of a song, but spaced roughly evenly throughout playlist

## Approach

- Order the artists based on most to least songs, ending with all songs in the playlist where an artist only appears once.
- Order of the songs by the same artist is randomized. So if there are 15 Bruce Springsteen songs, the order of those 15 songs is random within the playlist.
- The frequency of each artist or duplicate tracks through playlist is NOT random. They are spaced roughly evenly throughout the playlist. This avoids clustering of the same artist or duplicate songs close together in the playlist.

## Algorithm

- Go get the song list from a given playlist
- Figure out number of artists, songs per artist to calculate distribution.
- Randomize the artist’s songs
- Establish artist order by number of songs per artist.
- Look for like-named songs across artists. Swap appropriately to keep them apart
- Layout the new playlist

# Radio Sync

- I added a feature where you can sync your playlist to a radio station from iHeartRadio.
- Currently this is hard coded to a set of stations matched to a playlist, but I plan to expand this in the future.

## Deployment

The app is currently deployed on an AWS EC2 instance running Ubuntu.
