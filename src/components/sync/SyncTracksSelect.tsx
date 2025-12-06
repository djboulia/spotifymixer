import { Slider } from "../ui/slider";

export const SyncTracksSelect = ({
  value,
  onChange,
}: {
  value: number;
  onChange?: (value: number) => void;
}) => {
  const onSliderChange = (values: number[]) => {
    if (onChange) {
      onChange(values[0] ?? 10);
    }
  };

  return (
    <div className="'flex flex-col">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>Tracks to Sync:</div>
        <div className="min-w-10">{value}</div>
      </div>

      <Slider
        value={[value]}
        onValueChange={onSliderChange}
        max={250}
        min={10}
        step={10}
        className="mt-2 w-full"
        aria-label="Price Range"
      />
    </div>
  );
};
