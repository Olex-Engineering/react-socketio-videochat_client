import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

import { kServerURL } from './utils/constants'

const SocketContext = createContext();

const socket = io(kServerURL);

const ContextProvider = ({ children }) => {
    // State
    const [stream, setStream] = useState(null);
    const [currentUserId, serCurrentUserId] = useState('');
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setcallEnded] = useState(false);
    const [name, setName] = useState('');

    // Refs
    const videoEl = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    /**
     * Get stream from current user video and his id
     * Subscribe on socket events
     */
    useEffect(() => {
        const getCurrentStream = async () => {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(currentStream);

            videoEl.current.srcObject = currentStream;
        }

        getCurrentStream();

        socket.on('me', id => serCurrentUserId(id))

        socket.on('calluser', ({ from, naem: callerName, signal}) => {
            setCall({ isReceivedCall: true, from, name: callerName, signal })
        });
    }, []);

    /**
     * Answer on incoming call
     */
    const answerCall = () => {
        setCallAccepted(true);

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('answercall', { signal: data, to: call.from });
        });

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        peer.signal(call.signal);

        connectionRef.current = peer;
    }

    /**
     * Call user with userID
     * @param {String} targetId - target called user ID 
     */
    const callUser = (targetId) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('calluser', { userToCall: targetId, singalData: data, from: currentUserId, name });
        });

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        socket.on('callaccepted', (signal) => {
            setCallAccepted(true);

            peer.signal(signal);
        });

        connectionRef.current = peer;
    }

    /**
     * End call
     * With page reloading we unsubscribe from socket and peer connection
     */
    const leaveCall = () => {
        setcallEnded(true);

        connectionRef.current.destroy();

        window.location.reload();
    }

    return (
        <SocketContext value={{
            call,
            callAccepted,
            videoEl,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            currentUserId,
            callUser,
            leaveCall,
            answerCall,
        }}>
            { children }
        </SocketContext>
    )
}

export { ContextProvider, SocketContext };