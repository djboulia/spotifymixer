"use client";

import { useState } from "react";
import * as SpotifyApi from "~/app/server-actions/spotify";
import type { SpotifyTrackWithSearch } from "~/models/playlist";
import { Button } from "./ui/button";
import { ListContainer } from "./base/ListContainer";
import { ListHeader } from "./base/ListHeader";
import { RadioRow } from "./sync/RadioRow";
import { StationSyncResults } from "./sync/StationSyncResults";
import { PageContainer } from "./base/PageContainer";
import { useRouter } from "next/navigation";

type RadioStation = {
  name: string; // Station Name which shows on the button
  stationId: string; // iHeartRadio Station ID
  playListId: string; // Spotify Playlist ID to associate with the station
};

type RadioStationResults = RadioStation & {
  results?: SpotifyTrackWithSearch[];
};

const radioStations: RadioStationResults[] = [
  {
    name: "WRDU (Classic Rock)",
    stationId: "wrdu-fm",
    playListId: "2KUWvsEq7sAibXZR0xCCJ1",
    results: [],
  },
  {
    name: "G105 (Top 40)",
    stationId: "wdcg-fm",
    playListId: "5RcbbAMchnjjo6QSMwn7z4",
    results: [],
  },
  {
    name: "Mix 99.5 Holiday",
    stationId: "wmag-fm",
    playListId: "5sbYeTzDkrwSmTMBCC16AC", // Christmas 99.5 (Nov-Dec 2023)
    //  playListId: '5ugQ31xoBaNmMIRFyyU5AQ', // Mix 99.5 (Non-Seasonal)
    results: [],
  },
  {
    name: "B93.9 (New Country)",
    stationId: "wncb-fm",
    playListId: "5t809aA0Wvd6qrSHj6RUZL",
    results: [],
  },
  {
    name: "DC101 (Alternative Rock)",
    stationId: "wwdc-fm",
    playListId: "356fqj69ugsvFTBgRGK9Xr",
    results: [],
  },
  {
    name: "98 Rock (Rock)",
    stationId: "wxtb-fm",
    playListId: "7nyvjPt084p4cY7BPucDiF",
    results: [],
  },
  // { /* turn off durring christmas season */
  //   name: "U100.9 (60s and 70s)",
  //   stationId: "wiba-hd2",
  //   playListId: "6ZPhEMCM684QeeHb86BXr1",
  //   results: [],
  // },
  {
    name: "BIG 95.7 (80s and 90s)",
    stationId: "writ-fm",
    playListId: "5lcRbHcmQBqskUgv0OxFW4",
    results: [],
  },
  // { /* turn off during christmas season */
  //  name: "Majic 105.7 (70s and 80s)",
  //   stationId: "wmji-fm",
  //   playListId: "3HV1ocKu6cYKaOEOn8kihh",
  // results: [],
  // }
];

export default function RadioSync() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [radioStationResults, setRadioStationResults] =
    useState<RadioStationResults[]>(radioStations);

  const [numTracks, setNumTracks] = useState(250);

  const syncStation = async (
    station: RadioStationResults,
    numTracks: number,
  ) => {
    const stationId = station.stationId;
    const playListId = station.playListId;

    setLoading(true);
    // clear previous results
    station.results = undefined;
    setRadioStationResults([...radioStationResults]);

    const results = await SpotifyApi.radioSync(
      stationId,
      playListId,
      numTracks,
    ).catch((error) => {
      console.error("Error syncing radio station:", error);
      return [] as SpotifyTrackWithSearch[];
    });

    station.results = results;

    console.log("Sync results: ", results);
    setRadioStationResults([...radioStationResults]);
    setLoading(false);
    setLastSync(new Date());
  };

  const syncAll = async () => {
    for (const station of radioStationResults) {
      await syncStation(station, numTracks);
    }
  };

  const StationRow = ({
    radioStation,
  }: {
    radioStation: RadioStationResults;
  }) => {
    return (
      <RadioRow>
        <Button
          onClick={() => {
            void syncStation(radioStation, numTracks);
          }}
          disabled={loading}
          className="w-[300px] min-w-[300px]"
        >
          {radioStation.name}
        </Button>
        <StationSyncResults results={radioStation.results} />
      </RadioRow>
    );
  };

  return (
    <PageContainer
      title="Sync Radio Station with Playlist"
      onRouteChange={(path) => router.push(path)}
    >
      <ListContainer
        header={
          <ListHeader>
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <div className="flex flex-row items-center justify-between gap-4">
                <div>Tracks to Sync:</div>
                <div>
                  <input
                    className="w-16"
                    type="number"
                    value={numTracks}
                    onChange={(e) => setNumTracks(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="hidden w-full flex-row justify-end md:flex">
                <div className="m-4">
                  <b>Last sync {lastSync?.toLocaleString()}</b>
                </div>
              </div>
            </div>
          </ListHeader>
        }
      >
        {radioStationResults.map((station) => (
          <StationRow key={station.stationId} radioStation={station} />
        ))}

        <div className="flex flex-row items-center justify-center py-6">
          <Button
            className="w-[300px]"
            disabled={loading}
            onClick={() => void syncAll()}
          >
            Sync All
          </Button>
        </div>
      </ListContainer>
    </PageContainer>
  );
}
