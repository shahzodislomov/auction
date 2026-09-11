import { UnfoldMore } from "@mui/icons-material";
import React from "react";

export const AccountToggle = ({ user }) => {
    return (
        <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
            <button className="flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src="https://api.dicebear.com/9.x/notionists/svg"
                        alt="avatar"
                        className="size-8 rounded shrink-0 bg-primary shadow"
                    />
                    <div className="text-start">
                        <span className="text-sm font-bold block">{user?.firstname + " " + user?.lastname}</span>
                    <span className="text-xs block text-stone-500">{user?.email}</span>
                    </div>
                </div>
                <UnfoldMore />
            </button>
        </div>
    );
};