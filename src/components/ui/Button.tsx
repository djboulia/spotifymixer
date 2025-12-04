import classNames from "classnames";

export const Button = ({
  label,
  disabled,
  className,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <button
      disabled={disabled}
      className={classNames(
        "rounded-2xl px-4 py-2",
        disabled
          ? "bg-spotify-700/50 text-spotify-600"
          : "hover:bg-spotify-800 border-spotify-700 bg-spotify-800/50 shadow-spotify-800 text-spotify-100 cursor-pointer border font-bold shadow",
        className,
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
