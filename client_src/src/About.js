import React from 'react';
import Title from './Title';
import Dashboard from './Dashboard';

export default function About() {

  return (
    <Dashboard>
      <Title>About this App</Title>

      <p>
        I have lots of large playlists.  The normal shuffle function in Spotify has lots of issues documented all around the internet.  But the net is, I am always hearing the same songs and often hearing the same artist
        back to back.  If you were listening to the radio and an Elton John song came on, would you hear an Elton John song immediately afterwards?  Would you expect to hear the
        same Elton John song within the next hour?  You would not, but both scenarios happen more often than you'd think with the standard shuffle.
      </p>
      <p>

        So here are the basic rules I came up with:
        <ul>
          <li>
            Wouldn’t hear the same artist close together
          </li>
          <li>
            Wouldn’t hear the same titled song by two different artists close together
          </li>
          <li>
            Random within an artist or version of a song, but spaced roughly evenly throughout playlist
          </li>
        </ul>
      </p>

      <h3>Approach</h3>
      <ul>
        <li>
          The order of the artists based on most to least songs by the same artist, ending with all songs in the playlist where an artist only appears once.
        </li>
        <li>
          The order of the songs by the same artist is random
        </li>
        <li>
          The frequency of each artist through playlist is not random
        </li>
      </ul>
    </Dashboard>
  );
}