import { NavMenu } from "./NavMenu";
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
    <div className="text-surface-100 max-w-7xl md:mx-20">
      <div className="flex flex-row justify-between">
        <Title>{title}</Title>
        <NavMenu onNavigate={onRouteChange} />
      </div>

      {children}
    </div>
  );
};
