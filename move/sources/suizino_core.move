module mliolios::Suizino_core {
    // Part 1: imports
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::tx_context::{Self, TxContext};
    // Use this dependency to get a type wrapper for UTF-8 strings
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use std::vector;
    use sui::event;

    /// User doesn't have enough coins to play a round on the suizino
    const ENotEnoughMoney: u64 = 1;
    const EOutOfService: u64 = 2;

    /// Max multiplier for someone to win. e.g. max gains of this casino is cost_per_agem * 1000 (5000*1000 = 5000000)
    const MaxWinningsMultiplier: u64 = 5;

    /// max amount of combinations (we have a spinner of 5 elements (4+0)
    const AmountOfCombinations: u8 = 4;


    struct Casino has key, store{
        id: UID,
        name: String,
        description: String,
        cost_per_game: u64,
        casino_balance: Balance<SUI>
    }

    struct CasinoOwnership has key, store{
        id: UID
    }

    struct GambleEvent has copy, drop{
        id: ID,
        winnings: u64,
        gambler: address,
        slot_1: u8,
        slot_2: u8,
        slot_3: u8
    }

    // initialize our Suizino
    fun init(ctx: &mut TxContext) {
        transfer::transfer(CasinoOwnership{id: object::new(ctx)}, tx_context::sender(ctx));

        transfer::share_object(Casino {
            id: object::new(ctx),
            name: string::utf8(b"Suizino"),
            description: string::utf8(b"A small unsafe Suizino. Created by Manolis Liolios"),
            cost_per_game: 5000,
            casino_balance: balance::zero()
        });

    }

    public fun cost_per_game(self: &Casino): u64 {
        self.cost_per_game
    }

    public fun casino_balance(self:  &Casino): u64{
       balance::value<SUI>(&self.casino_balance)
    }

    // let's play a game
    public entry fun gamble(casino: &mut Casino, wallet: &mut Coin<SUI>, ctx: &mut TxContext){

        // calculate max user earnings through the casino
        let max_earnings = casino.cost_per_game * MaxWinningsMultiplier; // we calculate the maximum potential winnings on the casino.

        // Make sure Casino has enough money to support this gameplay.
        assert!(casino_balance(casino) >= max_earnings, EOutOfService);
        // make sure we have enough money to play a game!
        assert!(coin::value(wallet) >= casino.cost_per_game, ENotEnoughMoney);


        // get balance reference
        let wallet_balance = coin::balance_mut(wallet);

        // get money from balance
        let payment = balance::split(wallet_balance, casino.cost_per_game);

        // add to casino's balance.
        balance::join(&mut casino.casino_balance, payment);


        let uid = object::new(ctx);

        let randomNums = pseudoRandomNumGenerator(&uid);
        let winnings = 0;

        let slot_1 = *vector::borrow(&randomNums, 0);
        let slot_2 = *vector::borrow(&randomNums, 1);
        let slot_3 = *vector::borrow(&randomNums, 2);


        if(slot_1 == slot_2 && slot_2 == slot_3){
            winnings = casino.cost_per_game * (MaxWinningsMultiplier+1); // calculate winnings + the money the user spent.
            let payment = balance::split(&mut casino.casino_balance, winnings); // get from casino's balance.
            balance::join(coin::balance_mut(wallet), payment); // add to user's wallet!
            // add winnings to user's wallet
        };

        // emit event
        event::emit( GambleEvent{
            id: object::uid_to_inner(&uid),
            gambler: tx_context::sender(ctx),
            winnings,
            slot_1,
            slot_2,
            slot_3
        });

        // delete unused id
        object::delete(uid);



        // now let's play with luck!
    }


    /* A function for admins to deposit money to the casino so it can still function!  */
    public entry fun depositToCasino(_:&CasinoOwnership, casino :&mut Casino, amount: u64, payment: &mut Coin<SUI>){

        let availableCoins = coin::value(payment);
        assert!(availableCoins > amount, ENotEnoughMoney);

        let balance = coin::balance_mut(payment);

        let payment = balance::split(balance, amount);
        balance::join(&mut casino.casino_balance, payment);

    }

    /*
       A function for admins to get their profits.
    */
    public entry fun withdraw(_:&CasinoOwnership, casino: &mut Casino, amount: u64, wallet: &mut Coin<SUI>){

        let availableCoins = casino_balance(casino);
        assert!(availableCoins > amount, ENotEnoughMoney);

        let balance = coin::balance_mut(wallet);

        // split money from casino's balance.
        let payment = balance::split(&mut casino.casino_balance, amount);

        // execute the transaction
        balance::join(balance, payment);
    }

    /*
        *** This is not production ready code. Please use with care ***
       Pseudo-random generator. requires VRF in the future to verify randomness! Now it just relies on
       transaction ids.
    */

    fun pseudoRandomNumGenerator(uid: &UID):vector<u8>{

        // create random ID
        let random = object::uid_to_bytes(uid);
        let vec = vector::empty<u8>();

        // add 3 random numbers based on UID of next tx ID.
        vector::push_back(&mut vec, (*vector::borrow(&random, 0) as u8) % AmountOfCombinations);
        vector::push_back(&mut vec, (*vector::borrow(&random, 1) as u8) % AmountOfCombinations);
        vector::push_back(&mut vec, (*vector::borrow(&random, 2) as u8) % AmountOfCombinations);

        vec
    }



    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}