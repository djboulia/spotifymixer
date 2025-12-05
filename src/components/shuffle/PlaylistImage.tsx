/* eslint-disable @next/next/no-img-element */
export const PlaylistImage = ({
  img,
  alt,
}: {
  img?: string | null;
  alt?: string;
}) => {
  return img ? (
    <img
      src={img ?? ""}
      alt={alt ?? ""}
      height={40}
      width={40}
      className="rounded-md"
    />
  ) : (
    <div className="border-surface-100 h-10 w-10 rounded-md border"></div>
  );
};
