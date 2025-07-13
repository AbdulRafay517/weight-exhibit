import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectWebSocket } from './api';

// Planet data with icons and fun facts
const PLANETS = [
  {
    name: "Earth",
    gravity: 9.807,
    icon: "🌍",
    funFact: "Earth is the densest planet in the Solar System.",
  },
  {
    name: "Moon",
    gravity: 1.62,
    icon: "🌑",
    funFact: "The Moon is drifting away from Earth by 3.8 cm each year.",
  },
  {
    name: "Sun",
    gravity: 274,
    icon: "☀️",
    funFact: "The Sun contains 99.8% of the mass in our solar system.",
  },
  {
    name: "Mercury",
    gravity: 3.7,
    icon: "☿️",
    funFact: "Mercury has no atmosphere to retain heat.",
  },
  {
    name: "Uranus",
    gravity: 8.69,
    icon: "🪐",
    funFact: "Uranus rotates on its side.",
  },
  {
    name: "Pluto",
    gravity: 0.62,
    icon: "❄️",
    funFact: "Pluto is smaller than Earth's Moon.",
  },
  {
    name: "Pulsar",
    gravity: 1e3, // illustrative
    icon: "⭐",
    funFact: "A teaspoon of neutron star weighs about 6 billion tons.",
  },
];

const getGravityLevel = (gravity: number) => {
  if (gravity < 2) return "Low";
  if (gravity < 10) return "Medium";
  if (gravity < 100) return "High";
  return "Extreme";
};

const gravityColor = (gravity: number) => {
  if (gravity < 2) return "bg-green-400";
  if (gravity < 10) return "bg-blue-400";
  if (gravity < 100) return "bg-orange-400";
  return "bg-red-500";
};

const App: React.FC = () => {
  const [selected, setSelected] = useState(0); // Default to Earth
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend WebSocket
  useEffect(() => {
    const ws = connectWebSocket((newData) => {
      setData(newData);
      setLoading(false);
    });

    // Handle connection errors
    ws.onerror = () => setLoading(true);
    ws.onclose = () => setLoading(true);

    return () => ws.close();
  }, []);

  const planet = PLANETS[selected];
  const weight = data?.weights?.[planet.name] ?? null;
  const mass = data?.mass_kg ?? null;

  // Animation variants
  const planetVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const valueVariants = {
    initial: { scale: 0.9, opacity: 0.7 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0.7 },
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col overflow-hidden select-none">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-black/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
          <span className="font-bold text-white text-xl tracking-wider">Cosmic Weights</span>
        </div>
        <nav className="hidden md:flex gap-6 text-gray-300 text-base">
          <span className="hover:text-white transition-colors cursor-pointer">Home</span>
          <span className="hover:text-white transition-colors cursor-pointer">About</span>
          <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
        </nav>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white text-lg">👩</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 py-8">
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl"
        >
          Your Weight Across the Universe
        </motion.h1>

        {/* Planet Carousel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-6xl mb-8"
        >
          <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-4 px-4">
            {PLANETS.map((p, idx) => (
              <motion.button
                key={p.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center p-3 md:p-4 rounded-2xl transition-all duration-300 min-w-[100px] md:min-w-[120px] ${
                  selected === idx
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl shadow-blue-500/30 scale-105"
                    : "bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80"
                }`}
                onClick={() => setSelected(idx)}
              >
                <span className="text-3xl md:text-4xl mb-2 filter drop-shadow-lg">{p.icon}</span>
                <span className="text-white font-bold text-sm md:text-base">{p.name}</span>
                <span className="text-xs text-gray-300 mt-1 opacity-80">
                  {p.gravity} m/s²
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Data State */}
        {loading || mass === null || weight === null ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center mt-12"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-6xl text-blue-400 mb-6"
            >
              🚀
            </motion.div>
            <div className="text-white text-2xl font-semibold mb-2">
              Waiting for device...
            </div>
            <div className="text-gray-400 text-lg text-center max-w-md">
              Please place an object on the scale to begin your cosmic journey
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              variants={planetVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-4xl flex flex-col items-center"
            >
              {/* Weight Display Card */}
              <motion.div
                key={weight}
                variants={valueVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="w-full bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 mb-6 border border-gray-700/50 shadow-2xl"
              >
                {/* Planet Info Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{planet.icon}</span>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">{planet.name}</h2>
                      <p className="text-gray-300">Gravity: {planet.gravity} m/s²</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-white font-semibold ${gravityColor(planet.gravity)}`}>
                    {getGravityLevel(planet.gravity)}
                  </div>
                </div>

                {/* Weight Meter */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-semibold text-lg">
                      Your Weight on {planet.name}
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {weight.toLocaleString(undefined, { maximumFractionDigits: 1 })} N
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-4 rounded-full ${gravityColor(planet.gravity)} shadow-lg`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (weight / 1000) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-blue-300 text-xs mt-2 flex justify-between">
                    <span>Real-time measurement</span>
                    <span>{Math.min(100, (weight / 1000) * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Mass Display */}
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-1">Your Mass</div>
                  <motion.div
                    key={mass}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl md:text-2xl font-bold text-white"
                  >
                    {mass.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg
                  </motion.div>
                </div>
              </motion.div>

              {/* Fun Fact Card */}
              <motion.div
                key={planet.name + '-fact'}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl md:text-5xl">{planet.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                      <span>💡</span>
                      Did You Know?
                    </h3>
                    <p className="text-gray-200 text-base md:text-lg leading-relaxed">
                      {planet.funFact}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-gray-400 text-sm bg-black/30 backdrop-blur-sm border-t border-gray-700/50">
        <div className="flex items-center justify-center gap-2">
          <span>🔬</span>
          <span>Data provided by the Cosmic Research Institute</span>
          <span>🌌</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
