"use client"

import React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button";

import { AnimationStart, AnimationVariant, createAnimation } from "@/enums/theme-animations";


export function ThemeToggleButton({
    variant = "circle-blur",
    start = "top-left",
    showLabel = false,
    url = "",
}) {
    const { theme, setTheme } = useTheme()

    const styleId = "theme-transition-styles"

    const updateStyles = React.useCallback((css, name) => {
        if (typeof window === "undefined") return

        let styleElement = document.getElementById(styleId)

        if (!styleElement) {
            styleElement = document.createElement("style")
            styleElement.id = styleId
            document.head.appendChild(styleElement)
        }

        styleElement.textContent = css
    }, [])

    const toggleTheme = React.useCallback(() => {
        if (typeof window === "undefined") return

        const switchTheme = () => {
            setTheme(theme === "light" ? "dark" : "light")
        }

        // Simplified theme switching without complex animations to prevent memory issues
        try {
            if (document.startViewTransition && variant !== "none") {
                const animation = createAnimation(variant, start, url)
                updateStyles(animation.css, animation.name)
                document.startViewTransition(switchTheme)
            } else {
                switchTheme()
            }
        } catch (error) {
            // Fallback to simple theme switch if animations fail
            console.warn("Theme animation failed, using fallback:", error)
            switchTheme()
        }
    }, [theme, setTheme, variant, start, url, updateStyles])

    // Cleanup effect to prevent memory leaks
    React.useEffect(() => {
        return () => {
            if (typeof window !== "undefined") {
                const styleElement = document.getElementById(styleId)
                if (styleElement) {
                    styleElement.remove()
                }
            }
        }
    }, [styleId])

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