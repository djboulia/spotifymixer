import { ShuffleIcon } from "lucide-react";
import { IconLoadingeButton } from "./IconLoadingButton";

export const ShuffleButton = ({
  label,
  disabled,
  shuffling,
  className,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  shuffling: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <IconLoadingeButton
      disabled={disabled}
      loading={shuffling}
      onClick={onClick}
      icon={<ShuffleIcon />}
      label={label}
      className={className}
    />
  );
};
