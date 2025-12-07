import type { MixerCategoryStats } from "~/models/shuffle";

export const ProgressStats = ({
  categories,
}: {
  categories: MixerCategoryStats[];
}) => {
  console.log("categories: ", categories);
  const noSingles = categories.filter((cat) => cat.category != "[singles]");

  if (noSingles.length === 0) {
    return null;
  }

  return (
    <div className="m-2">
      <div className="max-h-[200px] min-h-[200px] min-w-[350px] overflow-y-auto px-4 md:min-w-[400px]">
        <div className="border-foreground/50 flex flex-row justify-between border-b py-2">
          <div className="w-[200px] truncate text-left text-ellipsis">
            Top Tracks
          </div>
          <div className="text-left">Type</div>
          <div className="text-right">Songs</div>
        </div>
        {noSingles.map((category, idx) => (
          <div
            key={idx}
            className="border-foreground/50 flex flex-row justify-between border-b py-2"
          >
            <div className="w-[200px] truncate text-left text-ellipsis">
              {category.category}
            </div>
            <div className="text-left">
              {category.type === "artist" ? "Artist" : "Title"}
            </div>
            <div className="text-right">{category.length}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
