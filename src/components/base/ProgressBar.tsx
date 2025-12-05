export const ProgressBar = ({
  percentComplete,
}: {
  percentComplete: number | undefined;
}) => {
  return (
    <div className="bg-surface-100 h-2 w-full min-w-10 rounded-lg">
      {/* Outer div for the full bar */}
      <div
        className="bg-primary-500 h-2 rounded-lg"
        style={{ width: `${percentComplete ?? 0}%` }} // Inner div for the progress
      ></div>
    </div>
  );
};
