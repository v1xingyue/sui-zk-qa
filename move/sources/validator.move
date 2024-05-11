module zkqa::validator {

    use sui::{hash};

    public struct Validator has store {
        id: UID,
        data: vector<u8>
    }
    
    public fun do_validate(_self: &Validator,answer: &vector<u8>) :bool {
        hash::blake2b256(answer) == _self.data
    }

    public fun clean(_self:Validator)  {
        let Validator{id,data:_} = _self;
        object::delete(id);
    }
    
    public fun new(ctx:&mut TxContext,data:vector<u8>) :Validator {
        Validator{
            id:object::new(ctx),
            data
        }
    }
    
}