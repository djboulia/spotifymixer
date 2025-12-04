import { Alert } from "./ui/Alert";

export const ErrorPage = ({ message }: { message: string }) => {
  return <Alert severity="error" message={message} />;
};
