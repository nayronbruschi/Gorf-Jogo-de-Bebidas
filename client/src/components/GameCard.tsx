import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

export function GameCard({ title, description, icon, href }: GameCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="cursor-pointer"
      >
        <Card className="h-full p-6 bg-white rounded-xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            {icon}
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          <p className="text-gray-600">{description}</p>
        </Card>
      </motion.div>
    </Link>
  );
}