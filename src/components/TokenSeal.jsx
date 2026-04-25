import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TokenSeal({ token, label = 'Token recuperado' }) {
  if (!token) return null;

  return (
    <motion.div
      className="flex items-center justify-between gap-3 border border-brass/35 bg-brass/10 p-4 text-brass shadow-aureate"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.22em]">{label}</p>
        <p className="mt-1 font-mono text-xl text-champagne">{token}</p>
      </div>
      <CheckCircle2 className="h-6 w-6" />
    </motion.div>
  );
}
