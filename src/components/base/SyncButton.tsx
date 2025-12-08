import { RefreshCcwIcon } from "lucide-react";
import { IconLoadingeButton } from "./IconLoadingButton";

export const SyncButton = ({
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
      icon={<RefreshCcwIcon className="text-highlight" />}
      label={label}
      className={className}
    />
  );
};
