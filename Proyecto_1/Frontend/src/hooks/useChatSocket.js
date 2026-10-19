import { useEffect, useRef } from 'react';
import { WS_URL } from '../config';

const RECONNECT_DELAY_MS = 3000;

// Canal de solo recepcion: el backend envia cada mensaje nuevo al emisor y al receptor.
export function useChatSocket(token, onMessage) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!token) return undefined;
    let socket;
    let reconnectTimer;
    let isClosedByUser = false;

    function connect() {
      socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message') handlerRef.current(data.message);
      };
      socket.onclose = () => {
        if (!isClosedByUser) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    }

    connect();
    return () => {
      isClosedByUser = true;
      clearTimeout(reconnectTimer);
      socket.close();
    };
  }, [token]);
}
