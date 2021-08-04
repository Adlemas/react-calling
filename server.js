const path = require('path')
const express = require('express');
const ACTIONS = require('./src/socket/actions');
const { validate, version } = require('uuid');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 80;

const getClientRooms = () => {
    const { rooms } = io.sockets.adapter

    return Array.from(rooms.keys()).filter(roomID => validate(roomID) && version(roomID) === 4)
}

const shareRoomsInfo = () => {
    io.emit(ACTIONS.SHARE_ROOMS, {
        rooms: getClientRooms()
    });
}

io.on('connection', socket => {
    shareRoomsInfo()

    socket.on(ACTIONS.JOIN, config => {
        const { room: roomId } = config;
        const { rooms: joinedRooms } = socket;

        if (Array.from(joinedRooms).includes(roomId)) {
            return console.warn(`Already joined to ${roomId}`)
        }

        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])

        clients.forEach(clientID => {
            io.to(clientID).emit(ACTIONS.ADD_PEER, {
                peerID: socket.id,
                createOffer: false
            })

            socket.emit(ACTIONS.ADD_PEER, {
                peerID: socket.id,
                createOffer: true
            })
        })

        socket.join(roomId)
        shareRoomsInfo()
    })

    function leaveRoom() {
        const { rooms } = socket;

        Array.from(rooms)
            .forEach(roomId => {
                const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

                clients.forEach(clientID => {
                    io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
                        peerID: socket.id
                    })

                    socket.emit(ACTIONS.REMOVE_PEER, {
                        peerID: clientID
                    })
                })

                socket.leave(roomId)
            })

        shareRoomsInfo()
    }

    socket.on(ACTIONS.LEAVE, leaveRoom)
    socket.on('disconnecting', leaveRoom)

    socket.on(ACTIONS.RELAY_SDP, ({ peerID, sessionDescription }) => {
        io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerID: socket.id,
            sessionDescription
        })
    })

    socket.on(ACTIONS.RELAY_ICE, ({ peerID, iceCandidate }) => {
        io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
            peerID: socket.id,
            iceCandidate
        })
    })
})

server.listen(PORT, () => {
    console.log('Server Started!')
})