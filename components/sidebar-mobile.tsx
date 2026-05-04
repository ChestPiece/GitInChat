"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

interface SidebarMobileProps {
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  chats?: Array<{
    id: string;
    title: string;
  }>;
  currentChatId?: string;
  onNewChat?: () => Promise<void>;
}

export function SidebarMobile({
  userEmail,
  userName,
  userAvatar,
  chats,
  currentChatId,
  onNewChat,
}: SidebarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden absolute top-4 left-4 z-40 text-white hover:bg-slate-800"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          user={{ name: userName, email: userEmail, image: userAvatar }}
          chats={(chats ?? []).map((chat) => ({
            id: chat.id,
            title: chat.title,
            active: chat.id === currentChatId,
          }))}
          onNewChat={() => {
            setIsOpen(false);
            void onNewChat?.();
          }}
        />
      </div>
    </>
  );
}
