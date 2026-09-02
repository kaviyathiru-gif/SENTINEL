import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Eye Icon */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="relative w-40 h-40">
          {/* Outer ring glow */}
          <motion.div
            className="absolute inset-0 border-2 border-purple-500/50 rounded-full"
            animate={{
              boxShadow: [
                '0 0 20px rgba(168, 85, 247, 0.5)',
                '0 0 40px rgba(168, 85, 247, 0.8)',
                '0 0 20px rgba(168, 85, 247, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Eye SVG */}
          <svg
            viewBox="0 0 200 200"
            className="w-40 h-40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            {/* Iris gradient definition */}
            <defs>
              <radialGradient id="irisGradient" cx="40%" cy="40%">
                <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Eye outline */}
            <path
              d="M 50 100 Q 100 50 150 100 Q 100 150 50 100"
              stroke="url(#irisGradient)"
              strokeWidth="2"
              fill="rgba(59, 130, 246, 0.1)"
              filter="url(#glow)"
            />

            {/* Iris */}
            <circle cx="100" cy="100" r="35" fill="url(#irisGradient)" filter="url(#glow)" />

            {/* Pupil */}
            <motion.circle
              cx="100"
              cy="100"
              r="20"
              fill="rgba(15, 23, 42, 0.9)"
              animate={{
                cx: [100, 110, 100, 90, 100],
                cy: [100, 95, 110, 105, 100]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Pupil highlight */}
            <circle
              cx="95"
              cy="95"
              r="8"
              fill="rgba(96, 165, 250, 0.8)"
              opacity="0.6"
            />
          </svg>
        </div>
      </motion.div>

      {/* Loading text */}
      <motion.div
        className="absolute bottom-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p className="text-lg text-gray-300 font-light tracking-widest">SENTINEL</p>
        <p className="text-sm text-purple-400 mt-2">Initializing NIDS...</p>

        {/* Loading dots */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-purple-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Security scan effect */}
      <motion.div
        className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
        animate={{
          borderImage: [
            'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), transparent) 1',
            'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0), transparent) 1'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
