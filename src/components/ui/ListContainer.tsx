import classNames from "classnames";

export const ListContainer = ({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-spotify-950 rounded-lg">
      {header && <>{header}</>}
      <div
        className={classNames(
          "flex flex-col p-4",
          header ? "m-2 md:m-10" : undefined,
        )}
      >
        {children}
      </div>
    </div>
  );
};
