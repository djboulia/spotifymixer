import classNames from "classnames";
import { FaCircleInfo, FaCircleExclamation } from "react-icons/fa6";

export const Alert = ({
  severity,
  message,
}: {
  severity: "error" | "info";
  message: string;
}) => {
  const severityClass =
    severity === "error"
      ? "relative mb-4 rounded border border-spotify-400/75 bg-spotify-100 px-4 py-3 text-red-700"
      : "relative mb-4 rounded border border-spotify-400/75 bg-spotify-100 px-4 py-3 text-blue-700";

  const AlertIcon = severity === "info" ? FaCircleInfo : FaCircleExclamation;

  return (
    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div
        className={classNames(
          severityClass,
          "flex flex-row items-center gap-4",
        )}
        role="alert"
      >
        <AlertIcon className="ml-2 inline" />
        <span>{message}</span>
      </div>
    </div>
  );
};
