import classNames from "classnames";

export const ListContainer = ({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-surface-500 text-light-50 rounded-lg">
      {header && <>{header}</>}
      <div
        className={classNames(
          "flex flex-col px-4 py-2",
          header ? "mx-2 md:mx-10" : undefined,
        )}
      >
        {children}
      </div>
    </div>
  );
};
