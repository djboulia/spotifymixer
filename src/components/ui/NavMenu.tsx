"use client";

import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import classNames from "classnames";
import { FaSpotify } from "react-icons/fa6";

export const NavMenu = ({
  onNavigate,
}: {
  onNavigate?: (path: string) => void;
}) => {
  const menuItemBase =
    "bg-surface-400/50 mx-2 w-[200px] hover:bg-surface-400 focus:bg-surface-400 active:bg-surface-400 p-2 text-primary-200";
  const menuItemDivider = "border-surface-300 border-t";

  return (
    <div className="flex flex-row items-center px-4">
      <Menu
        menuButton={
          <MenuButton>
            <FaSpotify className="text-primary-400 cursor-pointer" />
          </MenuButton>
        }
        direction="left"
        transition
      >
        <MenuItem
          className={classNames(menuItemBase, "rounded-tl-lg rounded-tr-lg")}
          onClick={() => onNavigate?.("/")}
        >
          Shuffle Single
        </MenuItem>
        <MenuItem
          className={classNames(menuItemBase, menuItemDivider)}
          onClick={() => onNavigate?.("/multiple")}
        >
          Shuffle Multiple
        </MenuItem>
        <MenuItem
          className={classNames(menuItemBase, menuItemDivider)}
          onClick={() => onNavigate?.("/radiosync")}
        >
          Radio Sync
        </MenuItem>
        <MenuItem
          className={classNames(
            menuItemBase,
            menuItemDivider,
            "rounded-br-lg rounded-bl-lg",
          )}
          onClick={() => onNavigate?.("/about")}
        >
          About
        </MenuItem>
      </Menu>
    </div>
  );
};
