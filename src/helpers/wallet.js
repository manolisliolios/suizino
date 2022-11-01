import {JsonRpcProvider, JsonRpcProviderWithCache} from "@mysten/sui.js";
import {suiRpcUrl} from "./constants";
import {computed, onMounted, ref} from "vue";
import {useAuthStore} from "../stores/auth";

const provider = new JsonRpcProvider(suiRpcUrl);
const suiWallet = window.suiWallet;


export function walletAccess() {
    const authStore = useAuthStore();
    const permissionGrantedError = ref("");


    const updateSuiAddress = (address) => {
        if(address) localStorage.setItem('user_sui_address', address);
        else localStorage.removeItem('user_sui_address');
        authStore.hasWalletPermission = !!address;
        authStore.userSuiAddress = address || null
    }

    const walletAddress = localStorage.getItem('user_sui_address');
    if(walletAddress) updateSuiAddress(walletAddress);

    // check wallet permissions. We might already have a wallet address but our permissions
    // are revoked by the wallet interface.

    const verifyWalletPermissions = () => {
        suiWallet.hasPermissions().then(res=>{
            console.log(res);

            if(!res) updateSuiAddress(null);
        }).catch(e=>{
            console.log(e);
        });
    }

    verifyWalletPermissions();

    // returns wallet address
    const getAddress = () => {
        return authStore.userSuiAddress;
    }

    // checks if we have a sui address to do any requests
    const isPermissionGranted = computed(() => {
        return authStore.userSuiAddress !== null;
    });

    // remove saved wallet address. Can't revoke permissions yet.
    const logout = () => {
        updateSuiAddress(null);
    }

    // prompt to request access to the wallet.
    const requestWalletAccess = () => {
        permissionGrantedError.value = "";
        suiWallet.requestPermissions().then(async res=>{
            await suiWallet.getAccounts().then(accounts => {
                updateSuiAddress(accounts[0]);
            });
        }).catch(e=>{
            permissionGrantedError.value = "You need to give us Sui Wallet permissions to continue.";
            updateSuiAddress(null);
        });
    }


    const executeMoveCall = async (params) => {
        return suiWallet.executeMoveCall(params);
    }

    return {provider, requestWalletAccess,getAddress,logout,executeMoveCall, isPermissionGranted, permissionGrantedError}
}