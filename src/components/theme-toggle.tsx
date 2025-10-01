import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    if (theme === "dark") {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />
    } else if (theme === "light") {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />
    } else {
      // System theme - show sun/moon based on system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      return systemTheme === "dark" ? 
        <Moon className="h-[1.2rem] w-[1.2rem]" /> : 
        <Sun className="h-[1.2rem] w-[1.2rem]" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode"
      case "dark":
        return "Switch to system theme"
      case "system":
        return "Switch to light mode"
      default:
        return "Toggle theme"
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={getThemeLabel()}
      aria-label={getThemeLabel()}
    >
      {getThemeIcon()}
      <span className="sr-only">{getThemeLabel()}</span>
    </Button>
  )
}