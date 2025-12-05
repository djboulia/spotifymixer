/**
 * flex row for md and up, flex col for smaller screens
 */
export const RadioRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-surface-300 flex flex-col items-center justify-between border-b py-2 md:flex-row">
      {children}
    </div>
  );
};
