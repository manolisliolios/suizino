#[test_only]
module mliolios::suizino_tests {
    use mliolios::Suizino_core::{Self, Casino, CasinoOwnership};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use sui::test_scenario;
    // use std::debug::print;

    #[test]
    public fun casino_gets_the_gamble() {

        let owner =  @0x1;
        let player = @0x2;

        let scenario_val = test_scenario::begin(owner);
        let scenario = &mut scenario_val;

        test_scenario::next_tx(scenario, owner);
        {
            Suizino_core::init_for_testing(test_scenario::ctx(scenario));
        };
        test_scenario::next_tx(scenario, player);
        {
            let casino = test_scenario::take_shared<Casino>(scenario);
            let casinoOwnership = test_scenario::take_from_address<CasinoOwnership>(scenario, owner);

            // print(&casinoOwnership);
            let ctx = test_scenario::ctx(scenario);
            let coinOb = coin::mint_for_testing<SUI>(30000, ctx);


            // deposit some money on the casino!
            Suizino_core::depositToCasino(&casinoOwnership, &mut casino, 25000, &mut coinOb);

            let balance = Suizino_core::casino_balance(&casino);

            assert!(Suizino_core::cost_per_game(&casino) == 5000, 1);
            assert!(balance == 25000, 1);

            // gamble the money (5000)
            Suizino_core::gamble(&mut casino, &mut coinOb, ctx); // 1st gamble

            coin::destroy_for_testing(coinOb);
            test_scenario::return_shared(casino);
            test_scenario::return_to_address(owner, casinoOwnership);
        };

        test_scenario::next_tx(scenario, owner);
        {
            let casino = test_scenario::take_shared<Casino>(scenario);
            let balance = Suizino_core::casino_balance(&mut casino);

            // nxt secnario, we have 10000 balance for my casino! :)))
            assert!(balance == 30000, 1);

            test_scenario::return_shared(casino);
        };

        test_scenario::end(scenario_val);


    }

}
