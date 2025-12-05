import classNames from "classnames";

export const ListHeader = ({ children }: { children: React.ReactNode }) => {
  const color = "bg-card text-card-foreground";

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
