const ROLE = {
  ControlInterface: "control_interface",
  Robot: "robot",
};

const BUTTON_ROBOT_COMMAND = {
  Stand: "X",
  Walk: "B",
  Sit: "A",
  EmgyStop: "Y",
};

const ZOOM_MODE = {
  In: 1,
  Out: -1,
};

const ENUM = { ROLE, BUTTON_ROBOT_COMMAND , ZOOM_MODE};

export default ENUM;
