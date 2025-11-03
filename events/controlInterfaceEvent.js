import _ from "lodash";
import ENUM from "../utils/enum.js";
import roomManager from "../roomManager.js";

export const handleControlInterfaceMessage = (client, data) => {
  console.log(data);
  const { BUTTON_ROBOT_COMMAND, ROLE, ZOOM_MODE } = ENUM;
  switch (data.event) {
    case "robot:command":
      {
        const button = data?.data?.button;
        if (!_.isString(button))
          throw new Error("Nút điều khiển phải là kiểu string.");
        if (!Object.values(BUTTON_ROBOT_COMMAND).includes(button.toUpperCase()))
          throw new Error(
            `Nút điều khiển phải là một trong ${Object.values(
              BUTTON_ROBOT_COMMAND
            )}`
          );
        switch (button) {
          case BUTTON_ROBOT_COMMAND.Stand:
            {
              console.log("robot:command - stand");
              roomManager.sendMessageToRoom({
                roomName: `${ROLE.Robot}_personal`,
                message: {
                  accid: "WF_TRON1A_341",
                  event: "remote-o2-control",
                  action: "request_stand_mode",
                  data: {},
                },
              });
            }
            break;
          case BUTTON_ROBOT_COMMAND.Walk:
            {
              console.log("robot:command - walk");
              roomManager.sendMessageToRoom({
                roomName: `${ROLE.Robot}_personal`,
                message: {
                  accid: "WF_TRON1A_341",
                  event: "remote-o2-control",
                  action: "request_walk_mode",
                  data: {},
                },
              });
            }
            break;
          case BUTTON_ROBOT_COMMAND.Sit:
            {
              console.log("robot:command - sit");
              roomManager.sendMessageToRoom({
                roomName: `${ROLE.Robot}_personal`,
                message: {
                  accid: "WF_TRON1A_341",
                  event: "remote-o2-control",
                  action: "request_sitdown",
                  data: {},
                },
              });
            }
            break;
          case BUTTON_ROBOT_COMMAND.EmgyStop:
            {
              console.log("robot:command - emgy stop");
              roomManager.sendMessageToRoom({
                roomName: `${ROLE.Robot}_personal`,
                message: {
                  accid: "WF_TRON1A_341",
                  event: "remote-o2-control",
                  action: "request_emgy_stop",
                  data: {},
                },
              });
            }
            break;
        }
      }
      break;
    case "robot:move":
      {
        const pose = data?.data;

        // 🧩 Kiểm tra x
        if (!_.isNumber(pose?.x) || pose.x < -1 || pose.x > 1) {
          throw new Error("Giá trị x không hợp lệ (phải là số từ -1 đến 1)");
        }

        // 🧩 Kiểm tra y
        if (!_.isNumber(pose?.y) || pose.y < -1 || pose.y > 1) {
          throw new Error("Giá trị y không hợp lệ (phải là số từ -1 đến 1)");
        }

        // ✅ Nếu qua kiểm tra thì gửi đi
        roomManager.sendMessageToRoom({
          roomName: `${ROLE.Robot}_personal`,
          message: {
            accid: "WF_TRON1A_341",
            event: "remote-o2-control",
            action: "request_twist",
            data: {
              x: pose.x,
              y: pose.y,
            },
          },
        });
      }
      break;
    case "camera:move":
      {
        const pose = data?.data;

        // 🧩 Kiểm tra x
        if (!_.isNumber(pose?.x) || pose.x < -1 || pose.x > 1) {
          throw new Error("Giá trị x không hợp lệ (phải là số từ -1 đến 1)");
        }

        // 🧩 Kiểm tra y
        if (!_.isNumber(pose?.y) || pose.y < -1 || pose.y > 1) {
          throw new Error("Giá trị y không hợp lệ (phải là số từ -1 đến 1)");
        }

        // ✅ Nếu qua kiểm tra thì gửi đi
        roomManager.sendMessageToRoom({
          roomName: `${ROLE.Robot}_personal`,
          message: {
            accid: "WF_TRON1A_341",
            event: "camera-control",
            action: "request_twist",
            data: {
              x: pose.x,
              y: pose.y,
            },
          },
        });
      }
      break;
    case "camera:zoom":
      {
        const direction = data?.data?.direction;

        if (!Object.values(ZOOM_MODE).includes(direction || null))
          throw new Error(
            `Chế độ zoom chỉ có thể là một trong các giá trị ${ZOOM_MODE}.`
          );
        // ✅ Nếu qua kiểm tra thì gửi đi
        roomManager.sendMessageToRoom({
          roomName: `${ROLE.Robot}_personal`,
          message: {
            accid: "WF_TRON1A_341",
            event: "camera-control",
            action: "request_twist",
            data: {
              direction,
            },
          },
        });
      }
      break;
    case "robot:online":
      {
        const clientInRoom = roomManager.getClientsInRoom(
          `${ENUM.ROLE.Robot}_personal`
        );
        client.send(
          JSON.stringify({
            event: "robot:online",
            data: {
              is_online: clientInRoom.length !== 0,
            },
          })
        );
      }
      break;
    default:
      console.log("⚠️ Event không hợp lệ từ control_interface:", data.event);
  }
};
