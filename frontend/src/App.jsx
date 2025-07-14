import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  CircularProgress,
  LinearProgress,
  styled,
  keyframes
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  Public,
  Star,
  Brightness7,
  Science
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Custom animations
const twinkle = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Motion variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const planetCardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

const planetRowVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const weightDisplayVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const selectedPlanetVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: {
      duration: 0.3
    }
  }
};

// Styled components
const StyledContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  background: 'linear-gradient(135deg, #0f0f23 0%, #1e1e3f 25%, #2d1b69 50%, #0f0f23 100%)',
  position: 'relative',
  overflow: 'hidden',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
}));

const StarField = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  '& .star': {
    position: 'absolute',
    width: '2px',
    height: '2px',
    backgroundColor: 'white',
    borderRadius: '50%',
    animation: `${twinkle} 3s infinite`,
  }
}));

const FloatingPlanet = styled(Box)(() => ({
  animation: `${float} 6s ease-in-out infinite`,
  fontSize: '4rem',
  position: 'absolute',
  opacity: 0.4,
  zIndex: 0,
}));

const PlanetCard = styled(Card)(({ theme, selected }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: selected ? '2px solid #90caf9' : '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  height: '140px',
  minWidth: '120px',
  width: '120px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '&:hover': {
    transform: 'scale(1.05)',
    border: '2px solid #90caf9',
    background: 'rgba(255, 255, 255, 0.15)',
  }
}));

const WeightDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #90caf9, #f48fb1)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textAlign: 'center',
}));

// Dark theme for space effect
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.1)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
  },
});

function App() {
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
      icon: <Public sx={{ fontSize: '4rem', color: '#4fc3f7' }} />,
      emoji: '🌍',
      description: 'Our home planet',
      gradient: 'linear-gradient(45deg, #2196f3, #4caf50)'
    },
    {
      name: 'Moon',
      icon: <Science sx={{ fontSize: '4rem', color: '#bdbdbd' }} />,
      emoji: '🌙',
      description: 'Earth\'s natural satellite',
      gradient: 'linear-gradient(45deg, #9e9e9e, #ffffff)'
    },
    {
      name: 'Mercury',
      icon: <Star sx={{ fontSize: '4rem', color: '#ff9800' }} />,
      emoji: '🟠',
      description: 'Closest planet to the Sun',
      gradient: 'linear-gradient(45deg, #ff9800, #ffc107)'
    },
    {
      name: 'Sun',
      icon: <Brightness7 sx={{ fontSize: '4rem', color: '#ffeb3b' }} />,
      emoji: '☀️',
      description: 'Our solar system\'s star',
      gradient: 'linear-gradient(45deg, #ffeb3b, #ff9800)'
    },
    {
      name: 'Uranus',
      icon: <Public sx={{ fontSize: '4rem', color: '#00bcd4' }} />,
      emoji: '🪐',
      description: 'The ice giant planet',
      gradient: 'linear-gradient(45deg, #00bcd4, #2196f3)'
    },
    {
      name: 'Pluto',
      icon: <Star sx={{ fontSize: '4rem', color: '#9c27b0' }} />,
      emoji: '🪐',
      description: 'The distant dwarf planet',
      gradient: 'linear-gradient(45deg, #9c27b0, #673ab7)'
    },
    {
      name: 'Pulsar',
      icon: <Star sx={{ fontSize: '4rem', color: '#e91e63' }} />,
      emoji: '✨',
      description: 'Ultra-dense neutron star',
      gradient: 'linear-gradient(45deg, #e91e63, #9c27b0)'
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

  const getWeightRatio = () => {
    const earthWeight = sensorData.weights.Earth || 1;
    return ((getCurrentWeight() / earthWeight) * 100);
  };

  // Generate random stars
  const generateStars = () => {
    return Array.from({ length: 50 }, (_, i) => (
      <Box
        key={i}
        className="star"
        sx={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
        }}
      />
    ));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <StyledContainer>
          {/* Animated Star Field */}
          <StarField>{generateStars()}</StarField>

          {/* Floating Decorative Planets */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              fontSize: '4rem',
              opacity: 0.4,
              zIndex: 0
            }}
          >
            🪐
          </motion.div>
          <motion.div
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '15%',
              fontSize: '4rem',
              opacity: 0.4,
              zIndex: 0
            }}
          >
            🌙
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <AppBar position="relative" sx={{ background: 'transparent', boxShadow: 'none', flexShrink: 0 }}>
              <Toolbar sx={{ minHeight: '48px !important', py: 1 }}>
                <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                  🌌 Cosmic Weights
                </Typography>
                <motion.div
                  animate={{
                    scale: isConnected ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    duration: 2,
                    repeat: isConnected ? Infinity : 0
                  }}
                >
                  <Chip
                    icon={isConnected ? <Wifi /> : <WifiOff />}
                    label={isConnected ? 'Connected' : 'Connecting...'}
                    color={isConnected ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </motion.div>
              </Toolbar>
            </AppBar>
          </motion.div>

          <Container maxWidth="xl" sx={{ py: 2, position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Hero Section */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card sx={{ mb: 2, p: 2, textAlign: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <Typography variant="h3" component="h1" gutterBottom>
                      How Much Would This Weigh in Space?
                    </Typography>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      Place any object on the scale to discover its weight across the universe!
                    </Typography>
                  </motion.div>

                  {/* Mass Display */}
                  <motion.div
                    variants={weightDisplayVariants}
                    initial="hidden"
                    animate="visible"
                    key={sensorData.mass_kg} // Re-animate when mass changes
                  >
                    <Box sx={{ mb: 1 }}>
                      {isLoading ? (
                        <CircularProgress size={40} />
                      ) : (
                        <WeightDisplay>
                          Mass: {sensorData.mass_kg.toFixed(2)} kg
                        </WeightDisplay>
                      )}
                    </Box>
                  </motion.div>
                </Box>
              </Card>
            </motion.div>

            {/* Celestial Bodies Single Row */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '16px', flexShrink: 0 }}
            >
              <Box sx={{ mb: 2, flexShrink: 0 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                    Select a Celestial Body
                  </Typography>
                </motion.div>
                <motion.div 
                  variants={planetRowVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    justifyContent: 'center'
                  }}
                  sx={{ 
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '3px',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.5)',
                      },
                    },
                  }}
                >
                  {celestialBodies.map((body, index) => (
                    <motion.div
                      key={body.name}
                      variants={planetCardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setSelectedPlanet(body.name)}
                      style={{ cursor: 'pointer' }}
                    >
                      <PlanetCard
                        selected={selectedPlanet === body.name}
                        sx={{
                          border: selectedPlanet === body.name ? '2px solid #90caf9' : '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 1, '&:last-child': { pb: 1 } }}>
                          <motion.div
                            animate={{
                              rotate: selectedPlanet === body.name ? [0, 360] : 0
                            }}
                            transition={{
                              duration: 2,
                              ease: "easeInOut"
                            }}
                          >
                            <Box sx={{ fontSize: '2rem', mb: 0.5 }}>
                              {body.emoji}
                            </Box>
                          </motion.div>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {body.name}
                          </Typography>
                          <motion.div
                            key={`${body.name}-${sensorData.weights[body.name]}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#90caf9' }}>
                              {formatWeight(sensorData.weights[body.name] || 0)}
                            </Typography>
                          </motion.div>
                        </CardContent>
                      </PlanetCard>
                    </motion.div>
                  ))}
                </motion.div>
              </Box>
            </motion.div>

            {/* Selected Planet Details */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <Card sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPlanet}
                    variants={selectedPlanetVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ textAlign: 'center', marginBottom: '16px' }}
                  >
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Box sx={{ fontSize: '4rem', mb: 1 }}>
                          {celestialBodies.find(body => body.name === selectedPlanet)?.emoji}
                        </Box>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <Typography variant="h4" gutterBottom>
                          {selectedPlanet}
                        </Typography>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                          {celestialBodies.find(body => body.name === selectedPlanet)?.description}
                        </Typography>
                      </motion.div>
                      <motion.div
                        key={`weight-${selectedPlanet}-${getCurrentWeight()}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <WeightDisplay>
                          {formatWeight(getCurrentWeight())}
                        </WeightDisplay>
                      </motion.div>
                    </Box>
                  </motion.div>
                </AnimatePresence>

                {/* Weight Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{ maxWidth: '500px', margin: '0 auto', flex: 1 }}
                >
                  <Box sx={{ maxWidth: 500, mx: 'auto', flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                      {selectedPlanet === 'Earth' ? 
                        'This is the normal Earth weight!' : 
                        `${getWeightRatio().toFixed(1)}% of the Earth weight`
                      }
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Lighter</Typography>
                        <Typography variant="body2">Earth Weight</Typography>
                        <Typography variant="body2">Heavier</Typography>
                      </Box>
                      <Box sx={{ position: 'relative' }}>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          style={{ originX: 0 }}
                        >
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(getWeightRatio(), 100)} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              '& .MuiLinearProgress-bar': {
                                background: celestialBodies.find(body => body.name === selectedPlanet)?.gradient
                              }
                            }} 
                          />
                        </motion.div>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            backgroundColor: 'white',
                            transform: 'translateX(-50%)'
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </Card>
            </motion.div>
          </Container>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Box sx={{ textAlign: 'center', py: 1, flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                © 2024 Cosmic Weights. All rights reserved.
              </Typography>
            </Box>
          </motion.div>
        </StyledContainer>
      </motion.div>
    </ThemeProvider>
  );
}

export default App;