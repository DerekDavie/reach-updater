const {
    contextBridge,
    ipcRenderer
} = require('electron')


// limits functions that can be called from the UI to just the one's listed in each type of call's 'validChannels'
contextBridge.exposeInMainWorld(
    "api", {
        sendSync: function(channel, data){
            let validChannels=['']
            if(validChannels.includes(channel)){
                return ipcRenderer.sendSync(channel, data)
            }
        },
        invoke: function(channel, data){
            let validChannels=['authenticate', 'getTags']
            if(validChannels.includes(channel)){
                return ipcRenderer.invoke(channel, data)
            }
        },
        sendAsync: function(channel, data){
            let validChannels=['updateTags']
            if(validChannels.includes(channel)){
                ipcRenderer.send(channel, data)
            }
        },
        recieveAsync: function(channel, func){
            let validChannels=['updateTagsUpdate']
            if(validChannels.includes(channel)){
                ipcRenderer.on(channel, (event, ...args) => func(...args))
            }
        },
        removeAllListeners: function(channel, func){
            let validChannels =['updateTagsUpdate']
            if(validChannels.includes(channel)){
                ipcRenderer.removeAllListeners(channel)
            }
        }
    }
)