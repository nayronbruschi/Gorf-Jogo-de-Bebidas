import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { LucideIcon } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  isFeatured?: boolean;
  featureTag?: string;
}

export function GameCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  isFeatured = false, 
  featureTag = "Em Destaque" 
}: GameCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="cursor-pointer h-full"
      >
        <Card className="h-full p-6 bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-bl-full"></div>
          
          {isFeatured && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-800 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md z-10 flex items-center space-x-1">
              <span className="block h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              <span>{featureTag}</span>
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gorf-purple rounded-xl shadow-sm">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          </div>
          
          <p className="text-slate-600 mb-6">{description}</p>
          
          <div className="flex justify-end mt-auto">
            <div className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md bg-gorf-green text-white">
              Jogar <ArrowRightIcon className="ml-1 h-4 w-4" />
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}