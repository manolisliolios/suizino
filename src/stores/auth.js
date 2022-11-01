import {defineStore} from "pinia";


export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        hasWalletPermission: false,
        userSuiAddress: null
    }),

    actions:{
    }
});