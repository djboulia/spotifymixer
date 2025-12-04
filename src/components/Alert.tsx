export const Alert = ({
  severity,
  message,
}: {
  severity: "error" | "info";
  message: string;
}) => {
  const severityClass =
    severity === "error"
      ? "relative mb-4 rounded border border-red-400/75 bg-red-100/75 px-4 py-3 text-red-700"
      : "relative mb-4 rounded border border-blue-400/75 bg-blue-100/75 px-4 py-3 text-blue-700";

  return (
    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className={severityClass} role="alert">
        <span>{message}</span>
      </div>
    </div>
  );
};
