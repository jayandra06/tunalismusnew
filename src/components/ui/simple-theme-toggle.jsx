"use client"

import React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button";

export function SimpleThemeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <Button
            onClick={toggleTheme}
            variant="ghost"
            className="!min-h-[45px] !min-w-[45px] rounded-full cursor-pointer"
            name="Theme Toggle Button"
        >
            <SunIcon className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[var(--color-dusty-rose)]" />
            <MoonIcon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#8ecae6]" />
            <span className="sr-only">Theme Toggle </span>
        </Button>
    )
}
