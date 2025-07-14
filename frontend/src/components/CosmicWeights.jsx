import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const CosmicWeights = () => {
  const [sensorData, setSensorData] = useState({
    mass_kg: 0,
    weights: {
      Earth: 0,
      Moon: 0,
      Sun: 0,
      Mercury: 0,
      Uranus: 0,
      Pluto: 0,
      Pulsar: 0
    }
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState('Earth');

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      // Replace with your Raspberry Pi IP address
      const ws = new WebSocket('ws://localhost:8000/ws');
      
      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
        setIsLoading(false);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setSensorData(data);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setIsLoading(false);
      };
    };
    
    connectWebSocket();
  }, []);

  const celestialBodies = [
    {
      name: 'Earth',
      color: 'from-blue-400 to-green-400',
      bgColor: 'bg-teal-900/30',
      image: '🌍',
      description: 'Your home planet'
    },
    {
      name: 'Moon',
      color: 'from-gray-300 to-gray-500',
      bgColor: 'bg-gray-200/20',
      image: '🌙',
      description: 'Earth\'s natural satellite'
    },
    {
      name: 'Mercury',
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-700/30',
      image: '☿️',
      description: 'Closest to the Sun'
    },
    {
      name: 'Sun',
      color: 'from-yellow-300 to-orange-400',
      bgColor: 'bg-orange-200/20',
      image: '☀️',
      description: 'Our solar system\'s star'
    },
    {
      name: 'Uranus',
      color: 'from-cyan-300 to-blue-400',
      bgColor: 'bg-cyan-900/30',
      image: '🪐',
      description: 'The ice giant'
    },
    {
      name: 'Pluto',
      color: 'from-purple-300 to-blue-300',
      bgColor: 'bg-purple-900/30',
      image: '🪐',
      description: 'Dwarf planet'
    },
    {
      name: 'Pulsar',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'bg-purple-900/30',
      image: '✨',
      description: 'Neutron star'
    }
  ];

  const getCurrentWeight = () => {
    return sensorData.weights[selectedPlanet] || 0;
  };

  const formatWeight = (weight) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(2)} kN`;
    }
    return `${weight.toFixed(1)} N`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (Math.random() * 3 + 2) + 's'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-white rounded-sm"></div>
            <h1 className="text-2xl font-bold tracking-wide">Cosmic Weights</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm">
                {isConnected ? 'Connected to Sensor' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-full max-w-4xl h-64 rounded-2xl bg-gradient-to-r from-teal-800/50 to-purple-800/50 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6 overflow-hidden">
            {/* Animated planet */}
            <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
                {/* Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 scale-150"></div>
                <div className="absolute inset-0 rounded-full border border-white/20 scale-125"></div>
              </div>
            </div>
            
            {/* Small moon */}
            <div className="absolute right-1/3 top-1/3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600"></div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                How Heavy Are You in Space?
              </h2>
            </div>
          </div>

          {/* Mass Display */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? (
                <Loader2 className="w-12 h-12 animate-spin mx-auto" />
              ) : (
                `Mass: ${sensorData.mass_kg.toFixed(2)} kg`
              )}
            </div>
          </div>
        </div>

        {/* Celestial Bodies Carousel */}
        <div className="mb-8">
          <div className="flex overflow-x-auto scrollbar-hide space-x-4 px-4 py-2 planet-carousel" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {celestialBodies.map((body) => (
              <div
                key={body.name}
                className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 flex-shrink-0 planet-card ${
                  selectedPlanet === body.name ? 'ring-4 ring-blue-400' : ''
                }`}
                onClick={() => setSelectedPlanet(body.name)}
              >
                <div className={`relative w-40 h-48 rounded-2xl ${body.bgColor} backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center p-4 group`}>
                  <div className="text-5xl mb-3">{body.image}</div>
                  <div className="text-lg font-semibold mb-2">{body.name}</div>
                  <div className="text-xs text-gray-300 text-center mb-3">{body.description}</div>
                  <div className="text-lg font-bold">
                    {formatWeight(sensorData.weights[body.name] || 0)}
                  </div>
                  
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${body.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Carousel Navigation Hint */}
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">← Swipe or scroll to explore more celestial bodies →</p>
          </div>
        </div>

        {/* Selected Planet Details */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl mr-4">
                {celestialBodies.find(body => body.name === selectedPlanet)?.image}
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2">{selectedPlanet}</h3>
                <p className="text-xl text-gray-300 mb-2">
                  {celestialBodies.find(body => body.name === selectedPlanet)?.description}
                </p>
                <div className="text-4xl font-bold text-blue-400">
                  {formatWeight(getCurrentWeight())}
                </div>
              </div>
            </div>
            
            {/* Weight ratio comparison */}
            <div className="text-center">
              <div className="text-lg text-gray-300 mb-4">
                {selectedPlanet === 'Earth' ? 
                  'This is your normal weight!' : 
                  `${((getCurrentWeight() / (sensorData.weights.Earth || 1)) * 100).toFixed(1)}% of your Earth weight`
                }
              </div>
              
              {/* Visual weight comparison bar */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Lighter</span>
                  <span>Earth Weight</span>
                  <span>Heavier</span>
                </div>
                <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-1/2 w-1 h-full bg-white transform -translate-x-1/2"
                    title="Earth weight reference"
                  ></div>
                  <div
                    className={`h-full bg-gradient-to-r ${celestialBodies.find(body => body.name === selectedPlanet)?.color} transition-all duration-500`}
                    style={{ 
                      width: `${Math.min(((getCurrentWeight() / (sensorData.weights.Earth || 1)) * 50), 100)}%`,
                      transformOrigin: 'left center'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 text-lg">
            Step on the scale to see your weight across the universe!
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-gray-400 text-sm">
        <p>@2024 Cosmic Weights. All rights reserved.</p>
      </div>
    </div>
  );
};

export default CosmicWeights;