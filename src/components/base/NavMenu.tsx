"use client";

import { FaSpotify } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

export const NavMenu = ({
  onNavigate,
}: {
  onNavigate?: (path: string) => void;
}) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <FaSpotify className="text-foreground cursor-pointer" />
            <span className="sr-only">More Options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onNavigate?.("/")}>
            Shuffle Single
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigate?.("/multiple")}>
            Shuffle Multiple
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigate?.("/radiosync")}>
            Radio Sync
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigate?.("/about")}>
            About
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
