import {JsonRpcProvider, JsonRpcProviderWithCache} from "@mysten/sui.js";
import {suiRpcUrl} from "./constants";
import {computed, onMounted, ref} from "vue";

const provider = new JsonRpcProvider(suiRpcUrl);
const suiWallet = window.suiWallet;

export function walletAccess() {
    const permissionGrantedError = ref("");
    const userSuiAddress = ref(null);
    const updateSuiAddress = (address) => {

        if(address){
            userSuiAddress.value = address;
            localStorage.setItem('user_sui_address', address);
        }else{
            userSuiAddress.value = null;
            localStorage.removeItem('user_sui_address');
        }
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
        return userSuiAddress.value;
    }

    // checks if we have a sui address to do any requests
    const isPermissionGranted = computed(() => {
        return userSuiAddress.value !== null;
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