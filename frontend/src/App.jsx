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

// Import celestial body images
import earthImg from './assets/celestial-bodies/earth.svg';
import moonImg from './assets/celestial-bodies/moon.svg';
import sunImg from './assets/celestial-bodies/sun.svg';
import mercuryImg from './assets/celestial-bodies/mercury.svg';
import uranusImg from './assets/celestial-bodies/uranus.svg';
import plutoImg from './assets/celestial-bodies/pluto.svg';
import pulsarImg from './assets/celestial-bodies/pulsar.svg';

// Import background image
import backgroundImg from './assets/backgrounds/bg4.jpg';

// Custom animations
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
  background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  position: 'relative',
  overflow: 'hidden',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
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
  height: '120px',
  minWidth: '100px',
  width: '100px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  touchAction: 'manipulation',
  userSelect: 'none',
  '&:hover, &:active': {
    transform: 'scale(1.05)',
    border: '2px solid #90caf9',
    background: 'rgba(255, 255, 255, 0.18)',
  }
}));

const WeightDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #90caf9, #f48fb1)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textAlign: 'center',
  letterSpacing: 1,
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
      fontSize: '1.5rem',
      '@media (max-width: 1200px)': { fontSize: '1.2rem' },
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.2rem',
      '@media (max-width: 1200px)': { fontSize: '1.1rem' },
    },
    h3: {
      fontSize: '1.1rem',
      '@media (max-width: 1200px)': { fontSize: '1rem' },
    },
    h4: {
      fontSize: '1rem',
      '@media (max-width: 1200px)': { fontSize: '0.95rem' },
    },
    h5: {
      fontSize: '0.95rem',
      '@media (max-width: 1200px)': { fontSize: '0.9rem' },
    },
    h6: {
      fontSize: '0.9rem',
      '@media (max-width: 1200px)': { fontSize: '0.85rem' },
    },
    body1: {
      fontSize: '0.95rem',
      '@media (max-width: 1200px)': { fontSize: '0.9rem' },
    },
    body2: {
      fontSize: '0.9rem',
      '@media (max-width: 1200px)': { fontSize: '0.85rem' },
    },
    subtitle1: {
      fontSize: '0.95rem',
      '@media (max-width: 1200px)': { fontSize: '0.85rem' },
    },
    caption: {
      fontSize: '0.8rem',
      '@media (max-width: 1200px)': { fontSize: '0.7rem' },
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          padding: '32px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minWidth: '80px',
          minHeight: '56px',
          fontSize: '1.3rem',
          borderRadius: '16px',
          padding: '16px 32px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          minHeight: '40px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: '18px',
          borderRadius: '9px',
        },
      },
    },
  },
});

function App() {
  const [sensorData, setSensorData] = useState({
    raw: 0,
    grams: 0,
    mass_kg: 0,
    weights_newton: {
      Sun: 0,
      Mercury: 0,
      Earth: 0,
      Moon: 0,
      Uranus: 0,
      Pluto: 0,
      Pulsar: 0
    }
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState('Earth');
  
  // Buffer to store the last 5 readings for averaging
  const [dataBuffer, setDataBuffer] = useState([]);

  // Function to calculate average of multiple data readings
  const calculateAverageData = (readings) => {
    if (readings.length === 0) return null;
    
    const avgData = {
      raw: 0,
      grams: 0,
      mass_kg: 0,
      weights_newton: {
        Sun: 0,
        Mercury: 0,
        Earth: 0,
        Moon: 0,
        Uranus: 0,
        Pluto: 0,
        Pulsar: 0
      }
    };
    
    // Calculate averages
    avgData.raw = readings.reduce((sum, r) => sum + r.raw, 0) / readings.length;
    avgData.grams = readings.reduce((sum, r) => sum + r.grams, 0) / readings.length;
    avgData.mass_kg = readings.reduce((sum, r) => sum + r.mass_kg, 0) / readings.length;
    
    // Average each celestial body weight
    Object.keys(avgData.weights_newton).forEach(planet => {
      avgData.weights_newton[planet] = readings.reduce((sum, r) => sum + (r.weights_newton[planet] || 0), 0) / readings.length;
    });
    
    return avgData;
  };

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
          
          // Add new data to buffer
          setDataBuffer(prevBuffer => {
            const newBuffer = [...prevBuffer, data];
            // Keep only the last 10 readings
            return newBuffer.slice(-5);
          });
          
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

  // Effect to process the data buffer every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (dataBuffer.length > 0) {
        // Calculate average of all readings in buffer
        const avgData = calculateAverageData(dataBuffer);
        
        if (avgData) {
          // Replace negative values with 0
          const safeData = {
            ...avgData,
            raw: avgData.raw < 0 ? 0 : avgData.raw,
            grams: avgData.grams < 0 ? 0 : avgData.grams,
            mass_kg: avgData.mass_kg < 0 ? 0 : avgData.mass_kg,
            weights_newton: Object.fromEntries(
              Object.entries(avgData.weights_newton || {}).map(([k, v]) => [k, v < 0 ? 0 : v])
            )
          };
          setSensorData(safeData);
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [dataBuffer]);

  const celestialBodies = [
    {
      name: 'Earth',
      icon: <Public sx={{ fontSize: '4rem', color: '#4fc3f7' }} />,
      image: earthImg,
      description: 'Our home planet',
      gradient: 'linear-gradient(45deg, #2196f3, #4caf50)'
    },
    {
      name: 'Moon',
      icon: <Science sx={{ fontSize: '4rem', color: '#bdbdbd' }} />,
      image: moonImg,
      description: 'Earth\'s natural satellite',
      gradient: 'linear-gradient(45deg, #9e9e9e, #ffffff)'
    },
    {
      name: 'Mercury',
      icon: <Star sx={{ fontSize: '4rem', color: '#ff9800' }} />,
      image: mercuryImg,
      description: 'Closest planet to the Sun',
      gradient: 'linear-gradient(45deg, #ff9800, #ffc107)'
    },
    {
      name: 'Sun',
      icon: <Brightness7 sx={{ fontSize: '4rem', color: '#ffeb3b' }} />,
      image: sunImg,
      description: 'Our solar system\'s star',
      gradient: 'linear-gradient(45deg, #ffeb3b, #ff9800)'
    },
    {
      name: 'Uranus',
      icon: <Public sx={{ fontSize: '4rem', color: '#00bcd4' }} />,
      image: uranusImg,
      description: 'The ice giant planet',
      gradient: 'linear-gradient(45deg, #00bcd4, #2196f3)'
    },
    {
      name: 'Pluto',
      icon: <Star sx={{ fontSize: '4rem', color: '#9c27b0' }} />,
      image: plutoImg,
      description: 'The distant dwarf planet',
      gradient: 'linear-gradient(45deg, #9c27b0, #673ab7)'
    },
    {
      name: 'Pulsar',
      icon: <Star sx={{ fontSize: '4rem', color: '#e91e63' }} />,
      image: pulsarImg,
      description: 'Ultra-dense neutron star',
      gradient: 'linear-gradient(45deg, #e91e63, #9c27b0)'
    }
  ];

  const getCurrentWeight = () => {
    const val = sensorData.weights_newton[selectedPlanet] || 0;
    return val < 0 ? 0 : val;
  };

  const formatWeight = (weight) => {
    const safeWeight = weight < 0 ? 0 : weight;
    if (safeWeight >= 1000) {
      return `${(safeWeight / 1000).toFixed(2)} kN`;
    }
    return `${safeWeight.toFixed(1)} N`;
  };

  const getWeightRatio = () => {
    const earthWeight = sensorData.weights_newton.Earth || 1;
    return ((getCurrentWeight() / earthWeight) * 100);
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
          {/* Floating Decorative Planets - Simplified */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '4rem',
              height: '4rem',
              opacity: 0.3,
              zIndex: 0
            }}
          >
            <img src={uranusImg} alt="Floating Uranus" style={{ width: '100%', height: '100%' }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: '20%',
              left: '15%',
              width: '4rem',
              height: '4rem',
              opacity: 0.3,
              zIndex: 0
            }}
          >
            <img src={moonImg} alt="Floating Moon" style={{ width: '100%', height: '100%' }} />
          </Box>

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
                <Chip
                  icon={isConnected ? <Wifi /> : <WifiOff />}
                  label={isConnected ? 'Connected' : 'Connecting...'}
                  color={isConnected ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                />
              </Toolbar>
            </AppBar>
          </motion.div>

          <Container maxWidth="xl" sx={{
            py: 1,
            position: 'relative',
            zIndex: 1,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '900px !important',
            minWidth: '600px',
            justifyContent: 'flex-start',
            overflow: 'hidden',
          }}>
            {/* Hero Section */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card sx={{ mb: 1, p: 1, textAlign: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
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
                  <Box sx={{ mb: 0.5 }}>
                      {isLoading ? (
                        <CircularProgress size={40} />
                      ) : (
                        <WeightDisplay>
                          Mass: {(sensorData.mass_kg < 0 ? 0 : sensorData.mass_kg).toFixed(2)} kg
                        </WeightDisplay>
                      )}
                    </Box>
                  </motion.div>

                  {/* Definitions for Mass and Weight */}
                  <Box sx={{
                    background: 'rgba(255,255,255,0.10)',
                    borderRadius: 1,
                    p: 1,
                    mb: 1,
                    maxWidth: 400,
                    mx: 'auto',
                    boxShadow: 1,
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#90caf9', mb: 0.5 }}>
                      What is Mass?
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <b>Mass</b> is the amount of matter in an object. It is measured in kilograms (kg) and does not change, no matter where the object is in the universe.
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f48fb1', mb: 0.5 }}>
                      What is Weight?
                    </Typography>
                    <Typography variant="body2">
                      <b>Weight</b> is the force with which gravity pulls on an object. It depends on both the object's mass and the gravity of the celestial body. Weight is measured in newtons (N) and changes depending on where you are in the universe.
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>

            {/* Celestial Bodies Single Row */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '8px', flexShrink: 0 }}
            >
              <Box sx={{ mb: 1, flexShrink: 0 }}>
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
                    paddingBottom: '6px',
                    paddingLeft: '6px',
                    paddingRight: '6px',
                    justifyContent: 'center',
                    WebkitOverflowScrolling: 'touch',
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
                        <CardContent sx={{ textAlign: 'center', p: 0.8, '&:last-child': { pb: 0.8 } }}>
                          <Box sx={{ width: '28px', height: '28px', mb: 0.3, mx: 'auto' }}>
                            <img 
                              src={body.image} 
                              alt={body.name} 
                              style={{ width: '100%', height: '100%' }} 
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.3 }}>
                            {body.name}
                          </Typography>
                          <motion.div
                            key={`${body.name}-${sensorData.weights_newton[body.name]}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#90caf9', fontSize: '0.85rem' }}>
                              {formatWeight(sensorData.weights_newton[body.name] || 0)}
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
              <Card sx={{ 
                p: 1, 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0, 
                justifyContent: 'space-between' 
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPlanet}
                    variants={selectedPlanetVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ 
                      textAlign: 'center', 
                      flex: '0 0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ width: '40px', height: '40px', mb: 0.5, mx: 'auto' }}>
                        <img 
                          src={celestialBodies.find(body => body.name === selectedPlanet)?.image} 
                          alt={selectedPlanet} 
                          style={{ width: '100%', height: '100%' }} 
                        />
                      </Box>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <Typography variant="h4" gutterBottom sx={{ mb: 0.5 }}>
                          {selectedPlanet}
                        </Typography>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
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
                  style={{ 
                    width: '100%', 
                    flex: '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: 0
                  }}
                >
                  <Box sx={{ 
                    width: '100%', 
                    maxWidth: '100%',
                    px: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h6" sx={{ 
                      mb: 1, 
                      textAlign: 'center', 
                      fontSize: 'clamp(0.8rem, 2.5vw, 1rem)'
                    }}>
                      {selectedPlanet === 'Earth' ? 
                        'This is the normal Earth weight!' : 
                        `${getWeightRatio().toFixed(1)}% of the Earth weight`
                      }
                    </Typography>
                    
                    <Box sx={{ mb: 1, width: '100%' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 0.5,
                        width: '100%'
                      }}>
                        <Typography variant="body2" sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)' }}>
                          Lighter
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)' }}>
                          Earth Weight
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)' }}>
                          Heavier
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'relative', width: '100%' }}>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          style={{ originX: 0, width: '100%' }}
                        >
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(getWeightRatio(), 100)} 
                            sx={{ 
                              height: 'clamp(8px, 1.5vh, 12px)', 
                              borderRadius: 'clamp(4px, 0.75vh, 6px)',
                              width: '100%',
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
                            width: '1px',
                            backgroundColor: 'white',
                            transform: 'translateX(-50%)',
                            borderRadius: 0.5,
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
            </Box>
          </motion.div>
        </StyledContainer>
      </motion.div>
    </ThemeProvider>
  );
}

export default App;