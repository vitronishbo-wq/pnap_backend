import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown } from "lucide-react";

interface MobileBottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxHeightClass?: string;
}

export function MobileBottomDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxHeightClass = "max-h-[85vh]"
}: MobileBottomDrawerProps) {
  // Prevent background scrolling when bottom sheet is open on smartphones
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Bottom Sheet Modal Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full sm:max-w-xl bg-slate-950 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col ${maxHeightClass} z-10 overflow-hidden font-sans`}
          >
            {/* Drag Handle Bar for mobile gesture feel */}
            <div className="w-full flex justify-center py-2 bg-slate-900/60 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-slate-700/80 rounded-full" />
            </div>

            {/* Bottom Sheet Header */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {icon && <div className="text-amber-400 shrink-0">{icon}</div>}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-100 truncate">{title}</h3>
                  {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer touch-manipulation"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Sheet Content */}
            <div className="p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
