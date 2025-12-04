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
import { Alert } from "./ui/Alert";
import { ShuffleProgressModal } from "./shuffle/ShuffleProgressModal";
import { Button } from "./ui/Button";
import { PlaylistImage } from "./shuffle/PlaylistImage";
import { PlaylistRow } from "./shuffle/PlaylistRow";
import { ListContainer } from "./ui/ListContainer";
import { ListHeader } from "./ui/ListHeader";
import { PageContainer } from "./ui/PageContainer";

type PlaylistWithChecks = Playlist & { checked?: boolean };

export const ShuffleMultiple = ({
  user,
  playlists,
}: {
  user?: User;
  playlists: Playlist[];
}) => {
  const [inProgress, setInProgress] = useState(false);
  const [playlistsChecked, setPlaylistsChecked] =
    useState<PlaylistWithChecks[]>(playlists);
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
        // reset the checkboxes for the playlist
        for (const playlist of playlistsChecked) {
          playlist.checked = false;
        }

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

  const shuffleMultiple = function () {
    const playListsIds: string[] = [];
    for (const playlist of playlistsChecked) {
      if (playlist.checked) {
        playListsIds.push(playlist.id);
      }
    }

    void Spotify.shuffleMultiple(playListsIds);

    setInProgress(true);
    setPercentComplete(0);
    setPlayListDetails({ name: "Play List", img: "" });
    setMultipleStatus(undefined);
    setCategories([]);

    startProgressTimer();
  };

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
        <Alert severity="error" message={errMsg} />
      </div>
    );
  }

  return (
    <PageContainer title={`Playlists for ${user?.name}`}>
      {inProgress && progressIndicator}

      <ListContainer
        header={
          <ListHeader>
            <div className="flex w-full flex-row items-center justify-center">
              <Button
                disabled={inProgress || nothingSelected()}
                onClick={() => {
                  shuffleMultiple();
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
              <input
                type="checkbox"
                checked={playlist.checked ?? false}
                onChange={(e) => {
                  playlist.checked = e.target.checked;
                  setPlaylistsChecked([...playlistsChecked]);
                }}
              />
            </div>
            <div className="flex w-[200px] flex-col items-center overflow-hidden px-2">
              <PlaylistImage img={playlist.img} alt={playlist.name} />
            </div>
            <div className="flex w-[200px] grow justify-start">
              {playlist.name}
            </div>
            <div className="flex w-[100px] justify-end">{playlist.total}</div>
          </PlaylistRow>
        ))}
      </ListContainer>
    </PageContainer>
  );
};
