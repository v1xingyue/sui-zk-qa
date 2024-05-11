module zkqa::zkqa {

    use std::string::{String,Self};
    use sui::{hex,package};
    use sui::tx_context::{sender};
    use sui::event;
    use sui::coin::{Self,Coin};
    use sui::balance::{Balance};
    

    // just modify this line, change validator to your own module
    use zkqa::validator as validator;

    const E_ANSWER_BAD: u64 = 0x3;

    public struct ZKQA has drop {}

    public struct QAEvent has copy, drop{
        msg: String
    }

    public struct QABox<T:store> has key, store {
        id: UID,
        question: String,
        reward: T,
        validator: validator::Validator,
    }

    fun init(otw: ZKQA, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        transfer::public_transfer(publisher, sender(ctx));
        event::emit(QAEvent { msg: string::utf8(b"init zkqa module")});
    }

    public fun new<T:store>(question: String,answer_hash_hex: vector<u8> ,reward:T,ctx:&mut TxContext): QABox<T> {
        event::emit(QAEvent { msg: string::utf8(b"new qa box")});
        QABox<T>{
            id: object::new(ctx),
            question,
            reward,
            validator: validator::new(ctx,hex::decode(answer_hash_hex)),
        }
    }
    
    // open box function
    fun get_reward<T:store>(box:QABox<T>): T {
        let QABox<T>{id,question:_,reward,validator:v} = box;
        v.clean();
        object::delete(id);
        reward
    }

    // T --> 0x2::sui::SUI
    entry public fun get_coin_reward<T>(box:QABox<Balance<T>>,answer: vector<u8>,ctx:&mut TxContext)  {
        assert!(box.validator.do_validate(&answer),E_ANSWER_BAD);
        let reward = get_reward(box);
        let coin = coin::from_balance<T>(reward,ctx);
        transfer::public_transfer(coin, sender(ctx));
    }

    // T --> 0x2::sui::SUI
    entry public fun new_coinbox_to_me<T>(question: String,answer_hash_hex: vector<u8> ,reward_coin:Coin<T>,ctx:&mut TxContext){
        let reward = coin::into_balance<T>(reward_coin);
        let box = new<Balance<T>>(question,answer_hash_hex,reward,ctx);
        transfer::public_transfer(box, sender(ctx));
    }

    entry public fun new_to_me<T:store>(question: String,answer_hash_hex: vector<u8> ,reward:T,ctx:&mut TxContext){
        let box = new(question,answer_hash_hex,reward,ctx);
        transfer::public_transfer(box, sender(ctx));
    }
    
}
