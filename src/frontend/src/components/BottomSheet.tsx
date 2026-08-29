import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const BottomSheet = ({ open, onClose, children }: BottomSheetProps) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          className="fixed inset-0 bg-black/60 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-900 rounded-t-2xl max-h-[70vh] flex flex-col"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <div className="flex items-center justify-end p-3 border-b border-neutral-800">
            <button
              onClick={onClose}
              className="p-1 -m-1 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto p-4">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
