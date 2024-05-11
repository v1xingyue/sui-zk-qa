module zkqa::fast_nft {

    use std::string::{utf8,String};
    use sui::url::{Self, Url};
    use sui::package;
    use sui::display;
    use sui::event;

    public struct FASTNFT has key,store {
        id: UID,
        name: String,
        description: String,
        // data:image/svg+xml;base64, xxxxxxxx
        // xxxx should be base64 encoded SVG ascii base64 encode xml of svg 
        image_url: Url
    }

    public struct FASTNFTMinted has copy, drop {
        // The Object ID of the NFT
        object_id: ID,
        // The creator of the NFT
        creator: address,
        // The name of the NFT
        name: String,
    }

    /// Get the NFT's `name`
    public fun name(nft: &FASTNFT): &String {
        &nft.name
    }

    /// Get the NFT's `description`
    public fun description(nft: &FASTNFT): &String {
        &nft.description
    }

    /// Get the NFT's `url`
    public fun image_url(nft: &FASTNFT): &Url {
        &nft.image_url
    }

    public struct FAST_NFT has drop {}

    fun init(otw: FAST_NFT, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"creator"),
        ];

        let values = vector[
            // For `name` one can use the `Hero.name` property
            utf8(b"{name}"),
            // For `image_url` use an IPFS template + `image_url` property.
            utf8(b"{image_url}"),
            // Description is static for all `Hero` objects.
            utf8(b"{description}"),
            // Creator field can be any
            utf8(b"CreatorsDAO")
        ];

        // Claim the `Publisher` for the package!
        let publisher = package::claim(otw, ctx);

        let mut display = display::new_with_fields<FASTNFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_freeze_object(display);
    }

    public fun create_fast_nft(
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,
        ctx: &mut TxContext
    ) : FASTNFT {
        FASTNFT {
            id: object::new(ctx),
            name: utf8(name),
            description: utf8(description),
            image_url: url::new_unsafe_from_bytes(url)
        }
    }

    entry fun mint_to_sender(
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let nft = create_fast_nft(name, description, url, ctx);
        event::emit(FASTNFTMinted {
            object_id: object::id(&nft),
            creator: sender,
            name: nft.name,
        });

        transfer::public_transfer(nft, sender);
    }

    /// Permanently delete `nft`
    entry fun burn(nft: FASTNFT, _: &mut TxContext) {
        let FASTNFT { id, name: _, description: _, image_url: _ } = nft;
        object::delete(id)
    }

}