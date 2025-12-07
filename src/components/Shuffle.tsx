"use client";

import { useState } from "react";
import type { Playlist } from "~/models/playlist";
import type { User } from "~/models/user";
import * as Spotify from "~/app/server-actions/spotify";
import type { PlayListDetails } from "~/models/playlist";
import type {
  MultipleShuffleProgressStatus,
  MixerCategoryStats,
} from "~/models/shuffle";
import { ShuffleProgressModal } from "./shuffle/ShuffleProgressModal";
import { PlaylistImage } from "./shuffle/PlaylistImage";
import { PlaylistRow } from "./shuffle/PlaylistRow";
import { ListContainer } from "./base/ListContainer";
import { ListHeader } from "./base/ListHeader";
import { PageContainer } from "./base/PageContainer";
import { useRouter } from "next/navigation";
import { AlertError } from "./base/AlertError";
import { ShuffleButton } from "./base/ShuffleButton";

export const Shuffle = ({
  user,
  playlists,
}: {
  user?: User;
  playlists: Playlist[];
}) => {
  const router = useRouter();
  const [inProgress, setInProgress] = useState(false);
  const [percentComplete, setPercentComplete] = useState(0);
  const [playListDetails, setPlayListDetails] = useState<PlayListDetails>({
    name: "Play List",
    img: "",
  });
  const [multipleStatus, setMultipleStatus] = useState<
    MultipleShuffleProgressStatus | undefined
  >(undefined);
  const [categories, setCategories] = useState<MixerCategoryStats[]>([]);
  const [errMsg, setErrMsg] = useState("");

  // set a timer to monitor progress
  const checkProgress = async () => {
    try {
      const result = await Spotify.shuffleProgress();
      console.log("progress; ", result);

      if (result.inProgress) {
        // update status
        setInProgress(true);
        if (result.shuffled === 0 || result.total === 0) {
          setPercentComplete(0);
        } else {
          setPercentComplete((result.shuffled / result.total) * 100);
        }

        // update play list name
        if (result.playList) {
          setPlayListDetails(result.playList);
        }

        if (result.multiple) {
          setMultipleStatus(result.multiple);
        }

        setCategories(result.categories);

        // still in proogress, so set another time out to check again
        setTimeout(() => {
          console.log("In Timeout");
          void checkProgress();
        }, 1000);
      } else {
        // complete - stop in progress indicator and clear timeout
        setInProgress(false);
        clearTimeout(undefined);
      }
    } catch (error) {
      console.log("error checking progress! ", error);
      setErrMsg("Error communicating with server!");
    }
  };

  const startProgressTimer = function () {
    setTimeout(() => {
      console.log("In Timeout");
      void checkProgress();
    }, 1000);
  };
  const shuffle = function (playListId: string) {
    console.log("id :" + playListId);

    void Spotify.shuffle(playListId);

    setInProgress(true);
    setPercentComplete(0);
    setPlayListDetails({ name: "Play List", img: "" });
    setMultipleStatus(undefined);
    setCategories([]);

    startProgressTimer();
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
                  shuffle(playlist.id);
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
