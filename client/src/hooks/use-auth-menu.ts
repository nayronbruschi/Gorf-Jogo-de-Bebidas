import { useMemo } from "react";
import { Home, GamepadIcon, UserCircle, Settings } from "lucide-react";
import { auth } from "@/lib/firebase";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export function useAuthMenu() {
  const user = auth.currentUser;
  const isAdmin = user?.email === "nayronbruschi@gmail.com";

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [
      { icon: Home, label: "Início", href: "/dashboard" },
      { icon: GamepadIcon, label: "Jogos", href: "/game-modes" },
      { icon: UserCircle, label: "Perfil e Estatísticas", href: "/profile" },
    ];

    if (isAdmin) {
      items.push({ icon: Settings, label: "Admin", href: "/admin" });
    }

    return items;
  }, [isAdmin]);

  return { menuItems };
}