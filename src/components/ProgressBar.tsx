export const ProgressBar = ({
  percentComplete,
}: {
  percentComplete: number | undefined;
}) => {
  if (!percentComplete || percentComplete <= 0) {
    return null;
  }

  return (
    <div className="bg-spotify-100 h-2 w-full rounded-lg">
      {/* Outer div for the full bar */}
      <div
        className="bg-spotify-500 h-2 rounded-lg"
        style={{ width: `${percentComplete}%` }} // Inner div for the progress
      ></div>
    </div>
  );
};
