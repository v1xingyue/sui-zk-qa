module zkqa::zkqa {

    use std::string::{String,Self};
    use sui::{hash,hex,package};
    use sui::tx_context::{sender};
    use sui::event;

    use sui::coin;
    use sui::balance::Balance;

    public struct ZKQA has drop {}

    public struct QAEvent has copy, drop{
        msg: String
    }

    public struct QABox<T:store> has key, store {
        id: UID,
        question: String,
        answer_hash: vector<u8>,
        reward: T
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
            answer_hash: hex::decode(answer_hash_hex),
        }
        
    }
    
    public fun answer<T:store>(box:QABox<T>,answer: vector<u8>) : T {
        assert!(hash::blake2b256(&answer) == box.answer_hash,0);
        get_reward(box)
    }

    fun get_reward<T:store>(box:QABox<T>): T {
        let QABox<T>{id,question:_,reward,answer_hash:_} = box;
        object::delete(id);
        reward
    }

    // T --> 0x2::sui::SUI
    entry public fun get_coin_reward<T>(box:QABox<Balance<T>>,answer: vector<u8>,ctx:&mut TxContext)  {
        assert!(hash::blake2b256(&answer) == box.answer_hash,0);
        let reward = get_reward(box);
        let coin = coin::from_balance<T>(reward,ctx);
        transfer::public_transfer(coin, sender(ctx));
    }
    
}
