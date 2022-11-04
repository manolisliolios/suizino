import {JsonRpcProvider} from "@mysten/sui.js";
import {moduleAddress, suiRpcUrl} from "./constants";
import {computed, onMounted, ref} from "vue";
import {useAuthStore} from "../stores/auth";
import {useUiStore} from "../stores/ui";

const provider = new JsonRpcProvider(suiRpcUrl);
const suiWallet = window.suiWallet;


export function useWallet() {
    const authStore = useAuthStore();
    const uiStore = useUiStore();
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
            if(!res) return logout();
            getUserCasinoOwnershipAndUserCoinAddresses();
        }).catch(e=>{
            logout();
        });
    }

    // gets the user's object and checks if we have a casino ownership.
    // We also keep a list of SUI Coin addresses to use for transactions.
    const getUserCasinoOwnershipAndUserCoinAddresses = () => {
        const address = getAddress();
        if(!address) return;

        provider.getObjectsOwnedByAddress(address).then(res =>{
            let casinoOwnership = res.find(x => x.type.includes('CasinoOwnership') && x.type.startsWith(moduleAddress));
            if(casinoOwnership){
                authStore.casinoAdmin.isAdmin = true;
                authStore.casinoAdmin.objectAddress = casinoOwnership.objectId;
            }

            let coinAddresses = res.filter(x => x.type.includes('Coin'));

            provider.getObjectBatch(coinAddresses.map(x => x.objectId)).then(res=>{

                const coins = res.map(x => {
                    return {
                        id: x?.details?.data?.fields?.id?.id,
                        balance: x?.details?.data?.fields?.balance
                    }
                });
                authStore.coins = coins;
            })

        }).catch(e =>{
            uiStore.setNotification(e.message);
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
        authStore.$reset();
    }

    // prompt to request access to the wallet.
    const requestWalletAccess = () => {
        permissionGrantedError.value = "";
        suiWallet.requestPermissions().then(async res=>{
            await suiWallet.getAccounts().then(accounts => {
                updateSuiAddress(accounts[0]);
                getUserCasinoOwnershipAndUserCoinAddresses();
            });
        }).catch(e=>{
            permissionGrantedError.value = "You need to give us Sui Wallet permissions to continue.";
            updateSuiAddress(null);
        });
    }

    const getSuitableCoinId = (amount) => {

        let coinId = null;
        for(let coin of authStore.coins){
            if(coin.balance >= amount){
                coinId = coin.id
                break;
            }
        }
        return coinId;
    }


    const executeMoveCall = async (params) => {
        return suiWallet.executeMoveCall(params);
    }

    const executeTransaction = async (params) => {
        return suiWallet.signAndExecuteTransaction(params);
    }

    return {provider, requestWalletAccess,getAddress,logout,executeMoveCall,getSuitableCoinId, isPermissionGranted, permissionGrantedError, executeTransaction}
}