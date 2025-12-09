"use client";

import { useEffect, useState } from "react";
import type { Playlist } from "~/models/playlist";
import type { User } from "~/models/user";
import { ShuffleProgressModal } from "./shuffle/ShuffleProgressModal";
import { PlaylistImage } from "./shuffle/PlaylistImage";
import { PlaylistRow } from "./shuffle/PlaylistRow";
import { ListContainer } from "./base/ListContainer";
import { ListHeader } from "./base/ListHeader";
import { PageContainer } from "./base/PageContainer";
import { useRouter } from "next/navigation";
import { AlertError } from "./base/AlertError";
import { Checkbox } from "./ui/checkbox";
import { ShuffleButton } from "./base/ShuffleButton";
import { useProgressIndicator } from "~/hooks/useProgressIndicator";

type PlaylistWithChecks = Playlist & { checked?: boolean };

export const ShuffleMultiple = ({
  user,
  playlists,
}: {
  user?: User;
  playlists: Playlist[];
}) => {
  const router = useRouter();
  const [playlistsChecked, setPlaylistsChecked] =
    useState<PlaylistWithChecks[]>(playlists);

  const {
    inProgress,
    percentComplete,
    playListDetails,
    multipleStatus,
    categories,
    errMsg,
    shuffle,
  } = useProgressIndicator();

  useEffect(() => {
    if (!inProgress) {
      // reset the checkboxes for the playlist
      for (const playlist of playlistsChecked) {
        playlist.checked = false;
      }
      setPlaylistsChecked([...playlistsChecked]);
    }
    // if we add playlistsChecked to the dependency array, we get an infinite loop since
    // we update it in the effect, whichi triggers the effect again. disable the lint rule for this line
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProgress]);

  const nothingSelected = function () {
    console.log("nothingSelected called");

    for (const playlist of playlistsChecked) {
      if (playlist.checked) {
        console.log("found a selected playlist: " + playlist.name);
        return false;
      }
    }
    return true;
  };

  const progressIndicator = (
    <ShuffleProgressModal
      playlist={playListDetails}
      multipleStatus={multipleStatus}
      percentComplete={percentComplete}
      categories={categories}
    />
  );

  if (errMsg != "") {
    console.log("Errmsg: " + errMsg);

    return (
      <div>
        <AlertError message={errMsg} />
      </div>
    );
  }

  return (
    <PageContainer
      title={`Playlists for ${user?.name}`}
      onRouteChange={(path) => router.push(path)}
    >
      {inProgress && progressIndicator}

      <ListContainer
        header={
          <ListHeader sticky={true}>
            <div className="border-foreground/20 flex w-full flex-row items-center justify-center border-b pb-10 md:mx-4">
              <ShuffleButton
                disabled={nothingSelected()}
                loading={inProgress}
                onClick={() => {
                  const playListsIds: string[] = [];
                  for (const playlist of playlistsChecked) {
                    if (playlist.checked) {
                      playListsIds.push(playlist.id);
                    }
                  }

                  shuffle(playListsIds);
                }}
                label="Shuffle Selected"
              />
            </div>
          </ListHeader>
        }
      >
        {playlistsChecked.map((playlist) => (
          <PlaylistRow key={playlist.id}>
            <div className="flex w-[50px] justify-center">
              <Checkbox
                checked={playlist.checked ?? false}
                onCheckedChange={(checked) => {
                  console.log("checkbox clicked for playlist: " + checked);
                  playlist.checked = checked === true;
                  setPlaylistsChecked([...playlistsChecked]);
                }}
              />
            </div>
            <div className="flex w-[200px] flex-col items-center overflow-hidden px-2">
              <PlaylistImage img={playlist.img} alt={playlist.name} />
            </div>
            <div className="text-foreground/75 flex w-[200px] grow justify-start">
              {playlist.name}
            </div>
            <div className="text-foreground/75 flex w-[100px] justify-end">
              {playlist.total}
            </div>
          </PlaylistRow>
        ))}
      </ListContainer>
    </PageContainer>
  );
};
