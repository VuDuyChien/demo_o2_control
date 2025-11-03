export const handleRobotMessage = (client, data) => {
  switch (data.event) {
    default:
      console.log("⚠️ Event không hợp lệ từ robot:", data.event);
  }
};
