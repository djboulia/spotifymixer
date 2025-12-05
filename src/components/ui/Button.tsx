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
        "rounded-xl px-4 py-2 text-sm",
        disabled
          ? "border-surface-100 text-surface-100 border"
          : "hover:bg-surface-200 border-surface-300 bg-surface-300 text-light-50 cursor-pointer border shadow",
        className,
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
