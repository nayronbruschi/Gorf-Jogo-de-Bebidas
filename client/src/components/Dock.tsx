import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Target, 
  GlassWater,
  Wine, 
  Hand,
  User
} from "lucide-react";

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
}

function DockItem({ icon, label, to, isActive }: DockItemProps) {
  const [, navigate] = useLocation();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      className={`relative flex flex-col items-center justify-center p-2
        ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
      onClick={() => navigate(to)}
    >
      <div className={`p-3 rounded-full transition-colors backdrop-blur-sm
        ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}
        border border-white/10 shadow-inner`}>
        {icon}
      </div>
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </motion.button>
  );
}

export function Dock() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="mx-4 mb-4 px-6 py-2 backdrop-blur-xl bg-black/30 rounded-3xl 
          flex items-center gap-4 shadow-xl border border-white/10
          max-w-md"
      >
        <DockItem
          icon={<Target className="h-6 w-6" />}
          label="Gorf"
          to="/roulette-mode"
          isActive={location.includes('roulette')}
        />
        <DockItem
          icon={<GlassWater className="h-6 w-6" />}
          label="Modos"
          to="/game-modes"
          isActive={location === '/game-modes'}
        />
        <DockItem
          icon={<Wine className="h-6 w-6" />}
          label="Garrafa"
          to="/spin-bottle"
          isActive={location === '/spin-bottle'}
        />
        <DockItem
          icon={<Hand className="h-6 w-6" />}
          label="Sorte"
          to="/touch-game"
          isActive={location === '/touch-game'}
        />
        <DockItem
          icon={<User className="h-6 w-6" />}
          label="Perfil"
          to="/profile"
          isActive={location === '/profile'}
        />
      </motion.div>
    </div>
  );
}