// server.js
import { WebSocketServer } from "ws";
import url from "url";
import roomManager from "./roomManager.js";
import ENUM from "./utils/enum.js";
import "dotenv/config";
import {
  handleControlInterfaceMessage,
  handleRobotMessage,
} from "./events/index.js";

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (client, req) => {
  const params = new URLSearchParams(url.parse(req.url).query);
  const role = params.get("role");

  // ✅ Kiểm tra role hợp lệ
  if (!role || !Object.values(ENUM.ROLE).includes(role)) {
    client.send(
      JSON.stringify({ error: "Thiếu hoặc sai role trong query string" })
    );
    client.close(4000, "Invalid or missing role");
    console.log("❌ Kết nối bị từ chối: thiếu hoặc sai role");
    return;
  }

  console.log(`Chào mừng ${role} đến với WebSocket Server!`);

  roomManager.joinRoom({
    client,
    roomName: `${role}_personal`,
  });

  roomManager.sendMessageToRoom({
    roomName: `${role}_personal`,
    message: {
      event: "connection_success",
      message: `Chào mừng ${role} đến với WebSocket Server!`,
    },
  });

  switch (role) {
    case ENUM.ROLE.Robot:
      {
        roomManager.sendMessageToRoom({
          roomName: `${ENUM.ROLE.ControlInterface}_personal`,
          message: {
            event: "robot:online",
            data: {
              is_online: true,
            },
          },
        });
      }
      break;
  }

  // Lưu role vào client để dùng về sau
  client.role = role;

  client.on("message", (buffer) => {
    const messageStr = buffer.toString();
    const data = JSON.parse(messageStr);
    try {
      switch (client.role) {
        case ENUM.ROLE.ControlInterface:
          handleControlInterfaceMessage(client, data);
          break;

        case ENUM.ROLE.Robot:
          handleRobotMessage(client, data);
          break;
      }
    } catch (err) {
      client.send(JSON.stringify({ message: err.message }));
    }
  });

  // Khi client ngắt kết nối
  client.on("close", () => {
    roomManager.leaveAllRooms(client);

    const clientInRoom = roomManager.getClientsInRoom(
      `${ENUM.ROLE.Robot}_personal`
    );
    if (clientInRoom.length === 0) {
      roomManager.sendMessageToRoom({
        roomName: `${ENUM.ROLE.ControlInterface}_personal`,
        message: {
          event: "robot:online",
          data: {
            is_online: false,
          },
        },
      });
    }
    console.log(`❌ Client (${role}) đã ngắt kết nối`);
  });
});

console.log(`🚀 WebSocket server đang chạy tại ws://localhost:${PORT}`);
