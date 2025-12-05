import type { SpotifyTrackWithSearch } from "~/models/playlist";

export const StationSyncResults = ({
  results,
}: {
  results: SpotifyTrackWithSearch[] | undefined;
}) => {
  const LastSyncContainer = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="text-foreground/75 flex w-full flex-row justify-start gap-4 px-4 py-2 md:justify-end">
        <div className="md:hidden">Last sync: </div>
        {children}
      </div>
    );
  };

  if (!results) {
    return (
      <LastSyncContainer>
        <div>Loading...</div>
      </LastSyncContainer>
    );
  }

  if (results.length === 0) {
    return (
      <LastSyncContainer>
        <div>No tracks added.</div>
      </LastSyncContainer>
    );
  }

  return (
    <LastSyncContainer>
      <div>
        {results.map((track) => (
          <div
            key={track.id}
            className="w-[200px] truncate overflow-hidden text-right text-ellipsis whitespace-nowrap md:w-[200px] lg:w-[400px]"
          >
            {track.name} by {track.artists[0]?.name ?? "Unknown Artist"}
          </div>
        ))}
      </div>
    </LastSyncContainer>
  );
};
