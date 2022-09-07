export let appChannel;
export const newAppChannel = (channelName = "app-data") => {
  appChannel = new BroadcastChannel(channelName);
};
