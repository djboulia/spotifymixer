import { AlertError } from "./base/AlertError";

export const ErrorPage = ({ message }: { message: string }) => {
  return <AlertError message={message} />;
};
