// API and WebSocket integration for backend
export function connectWebSocket(onData: (data: any) => void) {
  const ws = new WebSocket('ws://localhost:8000/ws');
  
  ws.onopen = () => {
    console.log('WebSocket connection opened');
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onData(data);
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  };
  
  return ws;
}

export async function fetchLatestWeight() {
  const res = await fetch('http://localhost:8000/api/weight');
  return res.json();
}
