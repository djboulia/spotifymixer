import { RefreshCcwIcon } from "lucide-react";
import { IconLoadingeButton } from "./IconLoadingButton";

export const SyncButton = ({
  label,
  disabled,
  syncing,
  className,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  syncing: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <IconLoadingeButton
      disabled={disabled}
      loading={syncing}
      onClick={onClick}
      icon={<RefreshCcwIcon />}
      label={label}
      className={className}
    />
  );
};
