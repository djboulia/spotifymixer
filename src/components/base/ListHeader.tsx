import classNames from "classnames";

export const ListHeader = ({ children }: { children: React.ReactNode }) => {
  const color =
    "to-surface-500/75 from-surface-400/25 text-light-50 bg-linear-to-t";
  return (
    <div
      className={classNames(
        color,
        "flex flex-row items-center justify-between",
        "px-10 py-6",
        "rounded-tl-lg rounded-tr-lg",
      )}
    >
      {children}
    </div>
  );
};
