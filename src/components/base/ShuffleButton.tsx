import { ShuffleIcon } from "lucide-react";
import { IconLoadingeButton } from "./IconLoadingButton";

export const ShuffleButton = ({
  label,
  disabled,
  loading,
  className,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  loading: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <IconLoadingeButton
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      icon={<ShuffleIcon className="text-highlight" />}
      label={label}
      className={className}
    />
  );
};
