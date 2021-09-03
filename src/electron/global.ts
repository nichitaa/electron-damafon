export {}

// definition for ipc
interface InotificationApi {
    sendNotification: (message: string) => void
}

interface IdbApi {
    getProducts: () => any
}

declare global {
    interface Window {
        "electron": {
            notificationApi: InotificationApi,
            dbApi: IdbApi
        }
    }
}
