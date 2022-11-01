import {acceptHMRUpdate, defineStore} from "pinia";


export const useUiStore = defineStore({
    id: 'ui',
    state: () => ({
        darkMode: null,
        showModal: false,
        notification: {
            type: 'error',
            value: null
        },
        notificationTypes: {
            error: 'error',
            success: 'success',
            info: 'info'
        }
    }),

    actions:{

        setShowModal(value){
            this.showModal = value;
        },

        setNotification(val, type){
            this.notification = {
                value: val,
                type: type || 'error'
            }
        }

    }
});