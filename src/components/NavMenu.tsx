"use client";

import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { FaSpotify } from "react-icons/fa6";

export const NavMenu = () => {
  const router = useRouter();
  const menuItemBase =
    "bg-spotify-950 mx-2 w-[200px] hover:bg-spotify-800 focus:bg-spotify-800 active:bg-spotify-800 p-2";
  const menuItemDivider = "border-spotify-800 border-t";

  return (
    <div className="flex flex-row items-center px-4">
      <Menu
        menuButton={
          <MenuButton>
            <FaSpotify className="text-spotify-300 cursor-pointer" />
          </MenuButton>
        }
        direction="left"
        transition
      >
        <MenuItem
          className={classNames(menuItemBase, "rounded-tl-lg rounded-tr-lg")}
          onClick={() => router.push("/")}
        >
          Shuffle Single
        </MenuItem>
        <MenuItem
          className={classNames(menuItemBase, menuItemDivider)}
          onClick={() => router.push("/multiple")}
        >
          Shuffle Multiple
        </MenuItem>
        <MenuItem
          className={classNames(menuItemBase, menuItemDivider)}
          onClick={() => router.push("/radiosync")}
        >
          Radio Sync
        </MenuItem>
        <MenuItem
          className={classNames(
            menuItemBase,
            menuItemDivider,
            "rounded-br-lg rounded-bl-lg",
          )}
          onClick={() => router.push("/about")}
        >
          About
        </MenuItem>
      </Menu>
    </div>
  );
};
