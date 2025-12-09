import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export const IconLoadingeButton = ({
  label,
  icon,
  disabled = false,
  loading = false,
  className,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <Button
      disabled={loading || disabled}
      onClick={onClick}
      className={className}
    >
      {loading ? <Spinner /> : icon}
      {label}
    </Button>
  );
};
