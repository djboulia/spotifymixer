import { Alert } from "./base/Alert";

export const ErrorPage = ({ message }: { message: string }) => {
  return <Alert severity="error" message={message} />;
};
