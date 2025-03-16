import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Target, 
  LayoutGrid, 
  MessageCircle, 
  Dice1, 
  Hand, 
  Wine,
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
      className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-colors
        ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
      onClick={() => navigate(to)}
    >
      <div className={`p-2 rounded-xl transition-colors
        ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}>
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
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
        className="mx-4 mb-4 p-2 backdrop-blur-xl bg-black/30 rounded-2xl flex items-center gap-2 shadow-xl border border-white/10"
      >
        <DockItem
          icon={<Target className="w-6 h-6" />}
          label="Roleta"
          to="/roulette-mode"
          isActive={location.includes('roulette')}
        />
        <DockItem
          icon={<LayoutGrid className="w-6 h-6" />}
          label="Cartas"
          to="/cards"
          isActive={location === '/cards'}
        />
        <DockItem
          icon={<MessageCircle className="w-6 h-6" />}
          label="Verdade"
          to="/truth-or-dare"
          isActive={location === '/truth-or-dare'}
        />
        <DockItem
          icon={<Dice1 className="w-6 h-6" />}
          label="Clássico"
          to="/classic-mode"
          isActive={location.includes('classic')}
        />
        <DockItem
          icon={<Hand className="w-6 h-6" />}
          label="Sorte"
          to="/touch-game"
          isActive={location === '/touch-game'}
        />
        <DockItem
          icon={<Wine className="w-6 h-6" />}
          label="Garrafa"
          to="/spin-bottle"
          isActive={location === '/spin-bottle'}
        />
        <DockItem
          icon={<User className="w-6 h-6" />}
          label="Perfil"
          to="/profile"
          isActive={location === '/profile'}
        />
      </motion.div>
    </div>
  );
}