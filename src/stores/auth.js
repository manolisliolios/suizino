import {defineStore} from "pinia";
import {localStorageKeys} from "../helpers/constants";


export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        walletProvider: localStorage.getItem(localStorageKeys.walletProvider),
        hasWalletPermission: false,
        userSuiAddress: localStorage.getItem(localStorageKeys.walletProvider),
        casinoAdmin: {
            isAdmin: false,
            objectAddress: null
        },
        coins: [],
        toggleWalletAuthModal: false
    }),

    actions:{
    }
});