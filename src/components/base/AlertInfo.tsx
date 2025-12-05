import { InfoIcon } from "lucide-react";
import { Alert, AlertTitle } from "../ui/alert";

export const AlertInfo = ({ message }: { message: string }) => {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
};
