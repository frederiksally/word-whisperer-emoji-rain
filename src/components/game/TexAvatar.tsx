
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TexAvatarProps {
  isConnected: boolean;
}

export const TexAvatar: React.FC<TexAvatarProps> = ({ isConnected }) => {
  return (
    <div className="relative">
      <Avatar className="h-32 w-32 border-4 border-amber-500 shadow-xl">
        <AvatarImage src="/graphics/tex-profile.png" alt="Tex" className="object-cover" />
        <AvatarFallback>Tex</AvatarFallback>
      </Avatar>
      {/* Pulsing "Live" indicator */}
      {isConnected && (
        <span className="absolute -top-1 -right-1 flex h-6 w-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-6 w-6 bg-green-500 border-2 border-white"></span>
        </span>
      )}
    </div>
  );
};
