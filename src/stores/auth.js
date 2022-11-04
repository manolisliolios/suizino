import {defineStore} from "pinia";


export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        hasWalletPermission: false,
        userSuiAddress: null,
        casinoAdmin: {
            isAdmin: false,
            objectAddress: null
        },
        coins: []
    }),

    actions:{
    }
});