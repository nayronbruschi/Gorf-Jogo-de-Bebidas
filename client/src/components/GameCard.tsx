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
        <Card className="h-full p-6 bg-white/95 backdrop-blur rounded-xl shadow-xl border-t border-purple-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full"></div>
          
          {isFeatured && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10">
              {featureTag}
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Icon className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-4">{description}</p>
          
          <div className="flex justify-end mt-auto">
            <div className="inline-flex items-center text-sm font-medium text-purple-700">
              Jogar <ArrowRightIcon className="ml-1 h-4 w-4" />
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}