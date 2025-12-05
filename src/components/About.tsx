"use client";

import { PageContainer } from "./base/PageContainer";
import { ListContainer } from "./base/ListContainer";
import { useRouter } from "next/navigation";

export const About = () => {
  const router = useRouter();

  return (
    <PageContainer
      title="About Spotify Mixer"
      onRouteChange={(path) => {
        router.push(path);
      }}
    >
      <ListContainer>
        <div className="text-light-200 mx-5 flex flex-col justify-center">
          <div className="my-5 flex justify-center">
            I have lots of large playlists. The normal shuffle function in
            Spotify has lots of issues documented all around the internet. But
            the net is, I am always hearing the same songs and often hearing the
            same artist back to back. If you were listening to the radio and an
            Elton John song came on, would you hear an Elton John song
            immediately afterwards? Would you expect to hear the same Elton John
            song within the next hour? You would not, but both scenarios happen
            more often than you&apos;d think with the standard shuffle.
          </div>
          <div className="my-5 flex flex-col justify-center">
            So here are the basic rules I came up with:
            <ul className="list-disc px-10">
              <li>Wouldn’t hear the same artist close together</li>
              <li>
                Wouldn’t hear the same titled song by two different artists
                close together
              </li>
              <li>
                Random within an artist or version of a song, but spaced roughly
                evenly throughout playlist
              </li>
            </ul>
          </div>

          <h3 className="text-light-50 my-2 text-xl font-semibold">Approach</h3>
          <ul>
            <li>
              The order of the artists based on most to least songs by the same
              artist, ending with all songs in the playlist where an artist only
              appears once.
            </li>
            <li>The order of the songs by the same artist is random</li>
            <li>The frequency of each artist through playlist is not random</li>
          </ul>
        </div>
      </ListContainer>
    </PageContainer>
  );
};
