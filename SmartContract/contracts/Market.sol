// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTMarketplace is IERC721Receiver, IERC1155Receiver {
    address public owner;
    uint256 public listingFee;

    IERC721 private erc721Token;
    IERC1155 private erc1155Token;
    IERC20 private erc20Token;

    enum ListingType { FixedPrice, Auction }

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 amount; // For ERC1155
        uint256 price;
        bool sold;
        ListingType listingType;
    }

    struct Offer {
        address buyer;
        uint256 tokenId;
        uint256 amount; // For ERC1155
        uint256 offerPrice;
        bool isAccepted;
    }

    struct Auction {
        uint256 tokenId;
        address payable seller;
        uint256 startTime;
        uint256 endTime;
        uint256 startingPrice;
        uint256 step;
        bool ended;
        address lastBider;
        uint256 lastBidAmount;
    }

    mapping(uint256 => MarketItem) public marketItems;
    mapping(uint256 => Auction) public auctions;

    event NFTListedForSale(address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 price);
    event NFTListedForAuction(address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 startTime, uint256 endTime, uint256 startingPrice, uint256 step);
    event NFTSold(address indexed buyer, address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 price);
    event NFTOffered(address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 price);
    event NFTOfferAccepted(address indexed buyer, address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 price);
    event NFTAuctionBidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event NFTAuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 winningBid);
    event NFTListingCancelled(address indexed seller, uint256 indexed tokenId);

    constructor(address _erc20Token, address _erc721Token, address _erc1155Token, uint256 _listingFee) {
        owner = msg.sender;
        erc721Token = IERC721(_erc721Token);
        erc1155Token = IERC1155(_erc1155Token);
        erc20Token = IERC20(_erc20Token);
        listingFee = _listingFee;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner is allowed");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    function setListingFee(uint256 _listingFee) external onlyOwner {
        listingFee = _listingFee;
    }

    function listForSale(uint256 tokenId, uint256 amount, uint256 price) external {
        require(erc721Token.ownerOf(tokenId) == msg.sender, "You are not the owner");

        // Check approval and transfer NFT to Marketplace for ERC721 or ERC1155
        if (amount > 1) {
            require(erc1155Token.isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
            erc1155Token.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        } else {
            require(erc721Token.getApproved(tokenId) == address(this) || erc721Token.isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
            erc721Token.safeTransferFrom(msg.sender, address(this), tokenId);
        }

        // Add item to marketplace
        marketItems[tokenId] = MarketItem({
            tokenId: tokenId,
            seller: payable(msg.sender),
            owner: payable(address(this)),
            amount: amount,
            price: price,
            sold: false,
            listingType: ListingType.FixedPrice
        });

        emit NFTListedForSale(msg.sender, tokenId, amount, price);
    }

    function listForAuction(uint256 tokenId,  uint256 amount,  uint256 startingPrice, uint256 startTime, uint256 endTime, uint256 bidStep) external {
        require(erc721Token.ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(startTime < endTime, "Invalid auction times");
        require(bidStep > 0, "Bid step must be greater than 0");

        // Check approval and transfer NFT to Marketplace for ERC721 or ERC1155
        if (amount > 1) {
            require(erc1155Token.isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
            erc1155Token.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        } else {
            require(erc721Token.getApproved(tokenId) == address(this) || erc721Token.isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
            erc721Token.safeTransferFrom(msg.sender, address(this), tokenId);
        }

        // Add item to marketplace
        marketItems[tokenId] = MarketItem({
            tokenId: tokenId,
            seller: payable(msg.sender),
            owner: payable(address(this)),
            amount: amount,
            price: startingPrice,
            sold: false,
            listingType: ListingType.Auction
        });

        // Start the auction
        auctions[tokenId] = Auction({
            tokenId: tokenId,
            seller: payable(msg.sender),
            startTime: startTime,
            endTime: endTime,
            startingPrice: startingPrice,
            step: bidStep,
            ended: false,
            lastBider: address(0),
            lastBidAmount: startingPrice
        });

        emit NFTListedForAuction(msg.sender, tokenId, amount, startTime, endTime, startingPrice, bidStep);
    }

    function buyNFT(uint256 tokenId, uint256 amount) external {
        MarketItem storage item = marketItems[tokenId];
        require(!item.sold, "NFT not available");

        // Calculate total price
        uint256 totalPrice = item.price * amount;

        // Check allowance for purchase
        require(erc20Token.allowance(msg.sender, address(this)) >= totalPrice, "Insufficient allowance for purchase");

        // Check allowance for listing fee
        require(erc20Token.allowance(item.seller, address(this)) >= listingFee, "Insufficient allowance for listing fee");

        // Transfer ERC20 tokens from buyer to seller
        erc20Token.transferFrom(msg.sender, item.seller, totalPrice);

        // Transfer listing fee to contract
        erc20Token.transferFrom(item.seller, owner, listingFee);

        // Transfer NFT to buyer (for ERC721 or ERC1155)
        if (amount > 1) {
            erc1155Token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
        } else {
            erc721Token.safeTransferFrom(address(this), msg.sender, tokenId);
        }

        // Update item ownership
        item.owner = payable(msg.sender);

        // Mark NFT as sold
        item.sold = true;

        emit NFTSold(msg.sender, item.seller, tokenId, amount, totalPrice);
    }

    function makeOffer(uint256 tokenId, uint256 amount, uint256 offerPrice) external {
        MarketItem storage item = marketItems[tokenId];
        require(!item.sold, "NFT not available");
        require(offerPrice > 0, "Invalid offer price");

        // Check allowance for offer
        require(erc20Token.allowance(msg.sender, address(this)) >= offerPrice, "Insufficient allowance for offer");

        // Transfer ERC20 tokens from buyer to contract
        erc20Token.transferFrom(msg.sender, address(this), offerPrice);

        emit NFTOffered(msg.sender, tokenId, amount, offerPrice);
    }

    function acceptOffer(uint256 tokenId, address buyer, uint256 offerPrice, address[] calldata bidders, uint256[] calldata amounts) external {
        MarketItem storage item = marketItems[tokenId];
        require(!item.sold, "NFT not available");
        require(msg.sender == item.seller, "Only seller can accept offers");
        require(item.listingType == ListingType.FixedPrice, "Cannot accept offers for auctions");

        // Transfer ERC20 tokens to seller
        erc20Token.transfer(msg.sender, offerPrice);

        // Transfer NFT to buyer (for ERC721 or ERC1155)
        if (item.amount > 1) {
            erc1155Token.safeTransferFrom(address(this), buyer, tokenId, item.amount, "");
        } else {
            erc721Token.safeTransferFrom(address(this), buyer, tokenId);
        }

        // Update item ownership
        item.owner = payable(buyer);

        // Mark NFT as sold
        item.sold = true;

        emit NFTOfferAccepted(buyer, msg.sender, tokenId, item.amount, offerPrice);

        // Refund remaining tokens to other offerers
        for (uint256 i = 0; i < bidders.length; i++) {
            if (bidders[i] != buyer) {
                erc20Token.transfer(bidders[i], amounts[i]);
            }
        }
    }


    function placeBid(uint256 tokenId, uint256 amount) external {
        Auction storage auction = auctions[tokenId];
        require(block.timestamp >= auction.startTime && block.timestamp <= auction.endTime, "Auction not active");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(amount > 0, "Bid amount must be greater than 0");

        // Check the current bid is satisfied
        require(amount >= auction.lastBidAmount + auction.step, "Bid must be higher than the current highest bid and meet the step requirement");

        // Transfer ERC20 tokens back to the previous highest bidder
        if (auction.lastBider != address(0)) erc20Token.transferFrom(address(this), auction.lastBider, auction.lastBidAmount);

        // Check allowance for transferFrom
        require(erc20Token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance for bid");

        // Transfer ERC20 tokens from the new bidder to the contract
        erc20Token.transferFrom(msg.sender, address(this), amount);

        // Update auction information
        auction.lastBider = msg.sender;
        auction.lastBidAmount = amount;

        emit NFTAuctionBidPlaced(tokenId, msg.sender, amount);
    }

    function endAuction(uint256 tokenId, uint256 amount) external {
        Auction storage auction = auctions[tokenId];
        require(block.timestamp > auction.endTime, "Auction not ended");
        require(!auction.ended, "Auction already ended");

        // Determine the winning bid and bidder
        require(auction.lastBider != address(0), "No bids placed");

        // Transfer NFT to the winner
        if (amount > 1) {
            erc1155Token.safeTransferFrom(address(this), auction.lastBider, tokenId, amount, "");
        } else {
            erc721Token.safeTransferFrom(address(this), auction.lastBider, tokenId);
        }
        erc721Token.safeTransferFrom(address(this), auction.lastBider, tokenId);

        // Transfer winning bid amount to the seller
        erc20Token.transfer(auction.seller, auction.lastBidAmount);

        // Mark the auction as ended
        auction.ended = true;

        emit NFTAuctionEnded(tokenId, auction.lastBider, auction.lastBidAmount);
    }

    function cancelListing(uint256 tokenId) external {
        MarketItem storage item = marketItems[tokenId];
        require(msg.sender == item.seller, "You are not the seller");
        require(!item.sold, "NFT already sold");

        // Transfer NFT back to the seller
        if (item.amount > 1) {
            erc1155Token.safeTransferFrom(address(this), item.seller, tokenId, item.amount, "");
        } else {
            erc721Token.safeTransferFrom(address(this), item.seller, tokenId);
        }

        // Mark the listing as cancelled
        delete marketItems[tokenId];

        emit NFTListingCancelled(item.seller, tokenId);
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override pure returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data) external override pure returns (bytes4) {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external override pure returns (bytes4) {
        return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
    }

    function supportsInterface(bytes4 interfaceId) external override pure returns (bool) {
        return interfaceId == type(IERC721Receiver).interfaceId || interfaceId == type(IERC1155Receiver).interfaceId;
    }
}
