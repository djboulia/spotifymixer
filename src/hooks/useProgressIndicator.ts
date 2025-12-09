import { useState } from "react";
import type { PlayListDetails } from "~/models/playlist";
import type {
  MixerCategoryStats,
  MultipleShuffleProgressStatus,
} from "~/models/shuffle";
import * as Spotify from "~/app/server-actions/spotify";

const POLL_INTERVAL_MS = 2000;

export function useProgressIndicator() {
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

  const startProgressTimer = function () {
    setTimeout(() => {
      console.log("In Timeout");
      void checkProgress();
    }, POLL_INTERVAL_MS);
  };

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
        startProgressTimer();
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

  const shuffleSingle = function (playListId: string) {
    console.log("id :" + playListId);

    void Spotify.shuffle(playListId);

    setInProgress(true);
    setPercentComplete(0);
    setPlayListDetails({ name: "Play List", img: "" });
    setMultipleStatus(undefined);
    setCategories([]);

    startProgressTimer();
  };

  const shuffle = function (playlistIds: string[]) {
    if (playlistIds.length === 1 && playlistIds[0]) {
      shuffleSingle(playlistIds[0]);
      return;
    }

    void Spotify.shuffleMultiple(playlistIds);

    setInProgress(true);
    setPercentComplete(0);
    setPlayListDetails({ name: "Play List", img: "" });
    setMultipleStatus(undefined);
    setCategories([]);

    startProgressTimer();
  };

  return {
    inProgress,
    percentComplete,
    playListDetails,
    multipleStatus,
    categories,
    errMsg,
    shuffle,
  };
}
