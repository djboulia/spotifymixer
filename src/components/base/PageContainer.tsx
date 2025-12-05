import { NavMenu } from "./NavMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Title } from "./Title";

export const PageContainer = ({
  title,
  children,
  onRouteChange,
}: {
  title: string;
  children: React.ReactNode;
  onRouteChange?: (path: string) => void;
}) => {
  return (
    <div className="max-w-7xl md:mx-20">
      <div className="flex flex-row justify-between">
        <Title>{title}</Title>
        <div className="flex flex-row items-center gap-4">
          <ThemeToggle />
          <NavMenu onNavigate={onRouteChange} />
        </div>
      </div>

      {children}
    </div>
  );
};
