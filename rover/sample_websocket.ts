const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5000/ws');

// Generate random sensor data
function generateSensorData() {
  return {
    temperature: +(20 + Math.random() * 5).toFixed(2),         // 20-25 °C
    speed: +(0.3 + Math.random() * 0.2).toFixed(2),            // 0.3–0.5 m/s
    latitude: +(34.0522 + (Math.random() * 0.001 - 0.0005)).toFixed(5),
    longitude: +(-118.2437 + (Math.random() * 0.001 - 0.0005)).toFixed(5),
    batteryLevel: +(85 + Math.random() * 10).toFixed(2),       // 85–95%
    signalStrength: +(70 + Math.random() * 20).toFixed(2),     // 70–90%
    cpuUsage: +(30 + Math.random() * 40).toFixed(2),           // 30–70%
    memoryUsage: +(40 + Math.random() * 30).toFixed(2),        // 40–70%
    distanceTraveled: +(Math.random() * 100).toFixed(2),       // 0–100 meters
    trips: Math.floor(Math.random() * 5),                      // 0–4 trips
    currentPosition: {
      x: +(Math.random() * 10).toFixed(2),
      y: +(Math.random() * 10).toFixed(2),
      z: +(Math.random() * 1).toFixed(2)
    }
  };
}

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');

  // Send initial CONNECT message
  ws.send(JSON.stringify({
    type: 'CONNECT',
    payload: {
      type: 'rover',
      identifier: 'R_TEST'
    }
  }));

  // Send TELEMETRY and STATUS_UPDATE every 5 seconds
  setInterval(() => {
    const sensorData = generateSensorData();

    ws.send(JSON.stringify({
      type: 'TELEMETRY',
      roverId: 1,
      payload: { sensorData }
    }));

    ws.send(JSON.stringify({
      type: 'STATUS_UPDATE',
      roverId: 1,
      payload: { status: 'active' }
    }));

    console.log('📡 Sent TELEMETRY & STATUS_UPDATE');
  }, 5000);
});

ws.on('message', (data) => {
  console.log('📥 Received:', data.toString());
});

ws.on('close', () => {
  console.log('❌ Disconnected from server');
});

ws.on('error', (err) => {
  console.error('❌ WebSocket Error:', err.message);
});
