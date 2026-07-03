import { Link, useNavigate } from "react-router-dom";
import { Plane, Sun, Moon, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const dashboardHref = user?.role === "staff" ? "/admin" : "/dashboard";
  const initials = (user?.name ?? user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl shadow-sm">
      {/* Thin gradient accent line at very top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />

      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Brand logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 shadow-md">
            <Plane className="size-4 text-white" />
          </div>
          <span className="hidden sm:inline">
            <span className="text-foreground">SkyJet</span>{" "}
            <span className="bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
              Flight Recovery
            </span>
          </span>
          <span className="font-bold sm:hidden">SkyJet</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full transition-all duration-300 hover:bg-accent"
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-amber-400 transition-transform duration-300 rotate-0" />
            ) : (
              <Moon className="size-4 transition-transform duration-300 rotate-0" />
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-700 to-blue-900 text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={dashboardHref}>
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:opacity-90 transition-opacity"
              >
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
