const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  focusBrowserBig: () => ipcRenderer.send('focus-browser-big'),
  focusBrowserMed: () => ipcRenderer.send('focus-browser-med'),
  focusBrowserSkinny: () => ipcRenderer.send('focus-browser-skinny'),
  focusBrowserSmall: () => ipcRenderer.send('focus-browser-small'),
  center: () => ipcRenderer.send('center'),
  prompt: () => ipcRenderer.send('prompt'),
  getActiveWindow: () => ipcRenderer.send('get-active-window'),
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, ...args) => func(args));
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
