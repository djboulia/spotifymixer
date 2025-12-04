import { NavMenu } from "./NavMenu";
import { Title } from "./ui/Title";

export const PageContainer = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="text-spotify-100 max-w-7xl md:mx-20">
      <div className="flex flex-row justify-between">
        <Title>{title}</Title>
        <NavMenu />
      </div>

      {children}
    </div>
  );
};
