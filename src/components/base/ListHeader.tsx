import classNames from "classnames";

export const ListHeader = ({
  sticky,
  children,
}: {
  sticky?: boolean;
  children: React.ReactNode;
}) => {
  const color = "bg-card text-card-foreground ";

  return (
    <div
      className={classNames(
        color,
        sticky ? "sticky top-0 z-10" : "",
        "flex flex-row items-center justify-between",
        "px-6 py-6 md:px-10",
        "rounded-tl-lg rounded-tr-lg",
      )}
    >
      {children}
    </div>
  );
};
