import SocketContext from './SocketContext';
import React, { useState, useEffect } from 'react';
// import { useCookies } from 'react-cookie';
import { io } from 'socket.io-client';
import Cookies from "universal-cookie";

const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const cookies = new Cookies();
        const newSocket = io('http://localhost:8888', {
        auth: {
            token: cookies.get("token") // Ajoute le token dans l'objet d'authentification lors de la connexion
        }
        });
        setSocket(newSocket);
        newSocket.on('connect', () => {
        setIsConnected(true);
        });
        newSocket.on('disconnect', () => {
        setIsConnected(false);
        });
        return () => newSocket.close();
    }, []);
    if (!isConnected) {
        return <div>Chargement...</div>;
    }
    return (
        <SocketContext.Provider value={socket}>
        {children}
        </SocketContext.Provider>
    );
};
export default SocketProvider;