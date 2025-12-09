"use client";

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
import { ShuffleButton } from "./base/ShuffleButton";
import { useProgressIndicator } from "~/hooks/useProgressIndicator";

export const Shuffle = ({
  user,
  playlists,
}: {
  user?: User;
  playlists: Playlist[];
}) => {
  const router = useRouter();

  const {
    inProgress,
    percentComplete,
    playListDetails,
    multipleStatus,
    categories,
    errMsg,
    shuffle,
  } = useProgressIndicator();

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
          <ListHeader>
            <div className="flex w-[100px] justify-center font-bold">
              Action
            </div>
            <div className="w-10" />
            <div className="flex w-[100px] justify-start font-bold md:w-[200px]">
              Playlist
            </div>
            <div className="flex w-[50px] justify-end font-bold md:w-[100px]">
              Songs
            </div>
          </ListHeader>
        }
      >
        {playlists.map((playlist) => (
          <PlaylistRow key={playlist.id}>
            <div className="flex w-[100px] justify-center">
              <ShuffleButton
                label="Shuffle"
                loading={inProgress}
                onClick={() => {
                  shuffle([playlist.id]);
                }}
              />
            </div>
            <div className="flex flex-col overflow-hidden rounded-md">
              <PlaylistImage img={playlist.img} alt={playlist.name} />
            </div>
            <div className="text-foreground/75 flex w-[100px] justify-start md:w-[200px]">
              {playlist.name}
            </div>
            <div className="text-foreground/75 flex w-[50px] justify-end md:w-[100px]">
              {playlist.total}
            </div>
          </PlaylistRow>
        ))}
      </ListContainer>
    </PageContainer>
  );
};
