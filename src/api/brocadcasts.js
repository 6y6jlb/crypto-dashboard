export const appChannel = new BroadcastChannel("app-data");
// window.dataChannel.addEventListener("message", (event) => {
//   console.log(event.data);
// });
// appChannel.onmessage = (event) => {
//   console.log(event);
// };
window.channel = { app: appChannel };
