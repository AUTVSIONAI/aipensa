import { createContext } from "react";
import openSocket from "socket.io-client";

const socketManager = {
	currentSocket: null,

	GetSocket: function () {
		const token = localStorage.getItem("token");

		if (token !== this.currentToken) {
			if (this.currentSocket) {
				this.currentSocket.disconnect();
			}

			this.currentToken = token;

			// Strip JSON quotes if present
			const cleanToken = token ? token.replace(/^"|"$/g, "") : null;

			this.currentSocket = openSocket(process.env.REACT_APP_BACKEND_URL, {
				transports: ["websocket"],
				pingTimeout: 18000,
				pingInterval: 18000,
				auth: cleanToken ? { token: cleanToken } : {},
			});
		}
		return this.currentSocket;
	},

	onConnect: function (callbackConnect) {
		if (this.currentSocket && this.currentSocket.connected) {
			callbackConnect();
		}
		this.currentSocket.on("connect", callbackConnect);
	},
};

const SocketContext = createContext()

export { SocketContext, socketManager };
