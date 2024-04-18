// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTMarketplace is IERC721Receiver, IERC1155Receiver {
    address public owner;
    uint256 public listingFeePercentage;
    uint256 public listingFeeDecimal;

    IERC721 private erc721Token;
    IERC1155 private erc1155Token;
    IERC20 private erc20Token;

    struct MarketItem {
        bool isErc721;
        address seller;
        uint256 amount;
        uint256 price;
    }

    struct Offer {
        address buyer;
        uint256 offerAmount;
        uint256 offerPrice;
        bool isCancelled;
    }

    struct Auction {
        bool isErc721;
        address seller;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 startingPrice;
        uint256 step;
        address lastBider;
        uint256 lastBidPrice;
    }

    mapping(uint256 => MarketItem) public marketItemsErc721;
    mapping(uint256 => mapping (address => MarketItem)) public marketItemsErc1155;

    mapping(uint256 => Offer[]) public offersErc721;
    mapping(uint256 => mapping (address => Offer[])) public offersErc1155;

    mapping(uint256 => Auction) public auctionsErc721;
    mapping(uint256 => mapping (address => Auction)) public auctionsErc1155;

    mapping(uint256 => address) public nftClaimsErc721;
    mapping(uint256 => mapping (address => uint256)) public nftClaimsErc1155;

    event NFTListedForSale(address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 price, bool isErc721);
    event NFTListedForAuction(address indexed creator, uint256 indexed tokenId, uint256 amount, uint256 startTime, uint256 endTime, uint256 startingPrice, uint256 step, bool isErc721);
    event NFTSold(address indexed buyer, address indexed seller, uint256 indexed tokenId, uint256 buyAmount, uint256 buyPrice, bool isSoldOut, bool isErc721);
    event NFTOffered(address indexed buyer, address indexed seller, uint256 indexed tokenId, uint256 offerAmount, uint256 offerPrice, bool isErc721);
    event NFTOfferCanceled(address indexed seller, uint256 indexed tokenId, uint256 offerId, bool isErc721);
    event NFTOfferAccepted(address indexed seller, uint256 indexed tokenId, uint256 offerId, bool isSoldOut, bool isErc721);
    event NFTAuctionBidPlaced(address indexed creator, uint256 indexed tokenId, address indexed bidder, uint256 amount, uint256 bidPrice, bool isErc721);
    event NFTAuctionEnded(address indexed creator, uint256 indexed tokenId, bool isErc721);
    event NFTClaimed(address indexed claimer, address indexed seller, uint256 indexed tokenId, uint256 amount, bool isAuction, bool isErc721);
    event NFTListingCancelled(address indexed seller, uint256 indexed tokenId, bool isErc721, bool isAuction);

    constructor(address _erc20Token, address _erc721Token, address _erc1155Token, uint256 _listingFeePercentage, uint256 _listingFeeDecimal) {
        owner = msg.sender;
        erc721Token = IERC721(_erc721Token);
        erc1155Token = IERC1155(_erc1155Token);
        erc20Token = IERC20(_erc20Token);
        listingFeePercentage = _listingFeePercentage;
        listingFeeDecimal = _listingFeeDecimal;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner is allowed");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    function setListingFee(uint256 _listingFeePercentage, uint256 _listingFeeDecimal) external onlyOwner {
        listingFeePercentage = _listingFeePercentage;
        listingFeeDecimal = _listingFeeDecimal;
    }

    function listForSale(uint256 tokenId, uint256 amount, uint256 price, bool isErc721) external {
        if (isErc721) {
            // Check owner nft (ERC721)
            require(erc721Token.ownerOf(tokenId) == msg.sender, "You are not the owner");

            // Check approval and transfer NFT to Marketplace (ERC721)
            require(erc721Token.getApproved(tokenId) == address(this) || erc721Token.isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
            erc721Token.safeTransferFrom(msg.sender, address(this), tokenId);

            // Add item to marketplace (ERC721)
            marketItemsErc721[tokenId] = MarketItem({
                isErc721: true,
                seller: msg.sender,
                amount: 1,
                price: price
            });
        } else {
            // Check owner nft (ERC1155)
            require(erc1155Token.balanceOf(msg.sender, tokenId) > 0, "You are not the owner");
            require(erc1155Token.balanceOf(msg.sender, tokenId) <= amount, "Not enough amount to list");

            // Check approval and transfer NFT to Marketplace (ERC1155)
            require(erc1155Token.isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
            erc1155Token.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

            // Add item to marketplace (ERC1155)
            marketItemsErc1155[tokenId][msg.sender] = MarketItem({
                isErc721: false,
                seller: msg.sender,
                amount: amount,
                price: price
            });
        }

        emit NFTListedForSale(msg.sender, tokenId, amount, price, isErc721);
    }

    function listForAuction(uint256 tokenId, uint256 amount, uint256 startingPrice, uint256 startTime, uint256 endTime, uint256 bidStep, bool isErc721) external {
        require(startTime < endTime, "Invalid auction times");
        require(bidStep > 0, "Bid step must be greater than 0");

        if (isErc721) {
            // Check owner nft (ERC721)
            require(erc721Token.ownerOf(tokenId) == msg.sender, "You are not the owner");

            // Check approval and transfer NFT to Marketplace (ERC721)
            require(erc721Token.getApproved(tokenId) == address(this) || erc721Token.isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
            erc721Token.safeTransferFrom(msg.sender, address(this), tokenId);

            // Start the auction (ERC721)
            auctionsErc721[tokenId] = Auction({
                isErc721: true,
                seller: msg.sender,
                amount: 1,
                startTime: startTime,
                endTime: endTime,
                startingPrice: startingPrice,
                step: bidStep,
                lastBider: address(0),
                lastBidPrice: startingPrice
            });
        } else {
            // Check owner nft (ERC1155)
            require(erc1155Token.balanceOf(msg.sender, tokenId) > 0, "You are not the owner");
            require(erc1155Token.balanceOf(msg.sender, tokenId) <= amount, "Not enough amount to list");

            // Check approval and transfer NFT to Marketplace (ERC1155)
            require(erc1155Token.isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
            erc1155Token.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

            // Start the auction (ERC1155)
            auctionsErc1155[tokenId][msg.sender] = Auction({
                isErc721: false,
                seller: msg.sender,
                amount: amount,
                startTime: startTime,
                endTime: endTime,
                startingPrice: startingPrice,
                step: bidStep,
                lastBider: address(0),
                lastBidPrice: startingPrice
            });
        }

        emit NFTListedForAuction(msg.sender, tokenId, amount, startTime, endTime, startingPrice, bidStep, isErc721);
    }

    function buyNFT(uint256 tokenId, address listter, uint256 buyAmount, bool isErc721) external {
        MarketItem storage item = isErc721? marketItemsErc721[tokenId] : marketItemsErc1155[tokenId][listter];
        require(item.seller != address(0), "Market item does not exist");
        require(buyAmount <= item.amount, "Exceeds the amount available to buy");

        // Save seller and price before deleting item
        address seller = item.seller;
        uint256 price = item.price;

        // Calculate total price and listing fee
        uint256 totalPrice = price * buyAmount;
        uint256 listingFee = calculateListingFee(totalPrice);

        // Check allowance for purchase
        require(erc20Token.allowance(msg.sender, address(this)) >= totalPrice, "Insufficient allowance for purchase");

        // Transfer ERC20 tokens from buyer to contract
        erc20Token.transferFrom(msg.sender, address(this), totalPrice);

        // Transfer listing fee to contract owner
        erc20Token.transfer(owner, listingFee);

        // Transfer remaining funds to seller
        erc20Token.transfer(seller, totalPrice - listingFee);

        // Transfer NFT to buyer (for ERC721 or ERC1155)
        if (isErc721) {
            erc721Token.safeTransferFrom(address(this), msg.sender, tokenId);
        } else {
            erc1155Token.safeTransferFrom(address(this), msg.sender, tokenId, buyAmount, "");
        }

        // Update market item
        item.amount -= buyAmount;
        bool isSoldOut = false;
        if (item.amount == 0) {
            isSoldOut = true;
            deleteMarketItem(tokenId, seller, isErc721);
        }

        // Refund offer
        refundOffer(tokenId, seller, isErc721);

        emit NFTSold(msg.sender, seller, tokenId, buyAmount, price, isSoldOut, isErc721);
    }

    function makeOffer(uint256 tokenId, address listter, uint256 offerAmount, uint256 offerPrice, bool isErc721) external {
        MarketItem memory item = isErc721? marketItemsErc721[tokenId] : marketItemsErc1155[tokenId][listter];
        require(item.seller != address(0), "Market item does not exist");
        require(offerAmount <= item.amount, "Exceeds the amount available to offer");
        
        // Calculate total price
        uint256 totalPrice = offerAmount * offerPrice;

        // Check allowance for offer
        require(erc20Token.allowance(msg.sender, address(this)) >= totalPrice, "Insufficient allowance for offer");

        // Transfer ERC20 tokens from buyer to contract
        erc20Token.transferFrom(msg.sender, address(this), totalPrice);

        // Mark offer (for ERC721 or ERC1155)
        if (isErc721) {
            offersErc721[tokenId].push(Offer({
                buyer: msg.sender,
                offerAmount: offerAmount,
                offerPrice: offerPrice,
                isCancelled: false
            }));
        }
        else {
            offersErc1155[tokenId][listter].push(Offer({
                buyer: msg.sender,
                offerAmount: offerAmount,
                offerPrice: offerPrice,
                isCancelled: false
            }));
        }

        emit NFTOffered(msg.sender, item.seller, tokenId, offerAmount, offerPrice, isErc721);
    }

    function cancelOffer(uint256 tokenId, address listter, uint256 offerId, bool isErc721) external {
        MarketItem memory item = isErc721 ? marketItemsErc721[tokenId] : marketItemsErc1155[tokenId][listter];
        require(item.seller != address(0), "Market item does not exist");
        
        // Find the offer
        Offer[] storage offers = isErc721 ? offersErc721[tokenId] : offersErc1155[tokenId][listter];
        require(offerId < offers.length, "Invalid offer ID");
        require(!offers[offerId].isCancelled, "Offer has already been cancelled");
        require(offers[offerId].buyer == msg.sender, "You are not making this offer");
        
        // Refund the buyer
        uint256 refundAmount = offers[offerId].offerAmount * offers[offerId].offerPrice;
        erc20Token.transfer(offers[offerId].buyer, refundAmount);

        // Mark offer cancel
        offers[offerId].isCancelled = true;
        
        emit NFTOfferCanceled(item.seller, tokenId, offerId, isErc721);
    }

    function acceptOffer(uint256 tokenId, address listter, uint256 offerId, bool isErc721) external {
        MarketItem storage item = isErc721? marketItemsErc721[tokenId] : marketItemsErc1155[tokenId][listter];
        require(item.seller != address(0), "Market item does not exist");
        require(msg.sender == item.seller, "You are not the seller");

        // Get the accepted offer
        Offer[] storage offers = isErc721? offersErc721[tokenId] : offersErc1155[tokenId][listter];
        require(offerId < offers.length, "Invalid offerId");
        Offer memory acceptedOffer = offers[offerId];
        require(!acceptedOffer.isCancelled, "Offer has already been cancelled");

        // Calculate total price and listing fee
        uint256 totalPrice = acceptedOffer.offerAmount * acceptedOffer.offerPrice;
        uint256 listingFee = calculateListingFee(totalPrice);

        // Transfer listing fee to contract owner
        erc20Token.transfer(owner, listingFee);

        // Transfer remaining funds to seller
        erc20Token.transfer(msg.sender, totalPrice - listingFee);

        // Refund remaining tokens to other offerers
        for (uint256 i = 0; i < offers.length; i++) {
            if (i != offerId && !offers[i].isCancelled) {
                uint256 refundAmount = offers[i].offerAmount * offers[i].offerPrice;
                erc20Token.transfer(offers[i].buyer, refundAmount);
            }
        }

        // Mark the winner who is allowed to claim nft and delete offers (for ERC721 or ERC1155)
        if (isErc721) {
            nftClaimsErc721[tokenId] = acceptedOffer.buyer;
            delete offersErc721[tokenId];
        }
        else {
            nftClaimsErc1155[tokenId][acceptedOffer.buyer] += acceptedOffer.offerAmount;
            delete offersErc1155[tokenId][acceptedOffer.buyer];
        }

        // Update market item
        item.amount -= acceptedOffer.offerAmount;
        bool isSoldOut = false;
        if (item.amount == 0) {
            isSoldOut = true;
            deleteMarketItem(tokenId, msg.sender, isErc721);
        }

        emit NFTOfferAccepted(msg.sender, tokenId, offerId, isSoldOut, isErc721);
    }

    function placeBid(uint256 tokenId, address listter, uint256 bidPrice, bool isErc721) external {
        Auction storage auction = isErc721? auctionsErc721[tokenId] : auctionsErc1155[tokenId][listter];
        require(auction.seller != address(0), "Auction is not available or has ended");
        require(auction.seller != msg.sender, "Seller cannot bid");
        require(block.timestamp >= auction.startTime && block.timestamp <= auction.endTime, "Auction not active");

        // Calculate total price
        uint256 totalPrice = auction.amount * bidPrice;

        // Check the current bid is satisfied
        require(totalPrice >= auction.lastBidPrice + auction.step, "Bid must be higher than the current highest bid and meet the step requirement");

        // Transfer ERC20 tokens back to the previous highest bidder
        if (auction.lastBider != address(0)) erc20Token.transfer(auction.lastBider, auction.lastBidPrice);

        // Check allowance for transferFrom
        require(erc20Token.allowance(msg.sender, address(this)) >= totalPrice, "Insufficient allowance for bid");

        // Transfer ERC20 tokens from the new bidder to the contract
        erc20Token.transferFrom(msg.sender, address(this), totalPrice);

        // Update auction information
        auction.lastBider = msg.sender;
        auction.lastBidPrice = totalPrice;

        emit NFTAuctionBidPlaced(auction.seller, tokenId, msg.sender, auction.amount, bidPrice, isErc721);
    }
    
    function endAuction(uint256 tokenId, address listter, bool isErc721) external {
        Auction memory auction = isErc721? auctionsErc721[tokenId] : auctionsErc1155[tokenId][listter];
        require(auction.seller != address(0), "Auction is not available or has ended");
        require(auction.seller == msg.sender, "You are not the creator");
        require(block.timestamp > auction.endTime, "Auction not ended");

        // Check for successful auction
        if (auction.lastBider != address(0)) {
             // Calculate total price and listing fee
            uint256 totalPrice = auction.lastBidPrice;
            uint256 listingFee = calculateListingFee(totalPrice);

            // Transfer listing fee to contract owner
            erc20Token.transfer(owner, listingFee);

            // Transfer winning bid amount to the seller (minus listing fee)
            erc20Token.transfer(auction.seller, totalPrice - listingFee);

            // Mark the winner who is allowed to claim nft
            if (isErc721) nftClaimsErc721[tokenId] = auction.lastBider;
            else nftClaimsErc1155[tokenId][auction.lastBider] += auction.amount;
        }
        else {
            // Transfer NFT back to the seller (for ERC721 or ERC1155)
            if (isErc721) {
                erc721Token.safeTransferFrom(address(this), auction.seller, tokenId);
            } else {
                erc1155Token.safeTransferFrom(address(this), auction.seller, tokenId, auction.amount, "");
            }
        }

        // Delete auction (for ERC721 or ERC1155)
        if (isErc721) delete auctionsErc721[tokenId];
        else delete auctionsErc1155[tokenId][listter];

        emit NFTAuctionEnded(msg.sender, tokenId, isErc721);
    }

    function claimedNFT(uint256 tokenId, address listter, uint256 amount, bool isAuction, bool isErc721) external {
        if (isErc721) {
            require(nftClaimsErc721[tokenId] == msg.sender, "You are not the winner");

            // Transfer NFT back to the winner and delete mark (ERC721)
            erc721Token.safeTransferFrom(address(this), msg.sender, tokenId); 
            delete nftClaimsErc721[tokenId];
        }
        else {
            require(nftClaimsErc1155[tokenId][msg.sender] >= amount, "You are not the winner");

            // Transfer NFT back to the winner and delete mark (ERC1155)
            erc1155Token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
            if (nftClaimsErc1155[tokenId][msg.sender] == amount) delete nftClaimsErc1155[tokenId][msg.sender];
            else nftClaimsErc1155[tokenId][msg.sender] -= amount;
        }

        emit NFTClaimed(msg.sender, listter, tokenId, amount, isAuction, isErc721);
    }


    function cancelListing(uint256 tokenId, address listter, bool isErc721, bool isAuction) external {
        if (!isAuction) {
            MarketItem memory item = isErc721 ? marketItemsErc721[tokenId] : marketItemsErc1155[tokenId][listter];
            require(item.seller != address(0), "Market item does not exist");
            require(item.seller == msg.sender, "You are not the seller");

            // Refund offer
            refundOffer(tokenId, msg.sender, isErc721);

            // Transfer NFT back to the seller and delete market item (for ERC721 or ERC1155)
            if (isErc721) {
                erc721Token.safeTransferFrom(address(this), item.seller, tokenId);
                delete marketItemsErc721[tokenId];
            } else {
                erc1155Token.safeTransferFrom(address(this), item.seller, tokenId, item.amount, "");
                delete marketItemsErc1155[tokenId][listter];
            }
        } else {
            Auction memory auction = isErc721 ? auctionsErc721[tokenId] : auctionsErc1155[tokenId][listter];
            require(auction.seller != address(0), "Auction is not available or has ended");
            require(auction.seller == msg.sender, "You are not the creator");
            require(block.timestamp < auction.endTime, "Auction ended");
            require(auction.lastBider == address(0), "Auction already has a bidder");

            // Transfer NFT back to the seller and delete auction (for ERC721 or ERC1155)
            if (isErc721) {
                erc721Token.safeTransferFrom(address(this), auction.seller, tokenId);
                delete auctionsErc721[tokenId];
            } else {
                erc1155Token.safeTransferFrom(address(this), auction.seller, tokenId, auction.amount, "");
                delete auctionsErc1155[tokenId][listter];
            }
        }

        emit NFTListingCancelled(msg.sender, tokenId, isErc721, isAuction);
    }

    function calculateListingFee(uint256 price) internal view returns (uint256) {
        uint256 fee = (price * listingFeePercentage) / (10 ** listingFeeDecimal) / 100;
        return fee;
    }

    function deleteMarketItem(uint256 tokenId, address listter, bool isErc721) internal {
        if (isErc721) {
            delete marketItemsErc721[tokenId];
        } else {
            delete marketItemsErc1155[tokenId][listter];
        }
    }

    function refundOffer(uint256 tokenId, address listter, bool isErc721) internal  {
        Offer[] memory offers = isErc721 ? offersErc721[tokenId] : offersErc1155[tokenId][listter];
        if (offers.length > 0) {
            for (uint256 i = 0; i < offers.length; i++) {
                if (!offers[i].isCancelled) {
                    uint256 refundAmount = offers[i].offerAmount * offers[i].offerPrice;
                    erc20Token.transfer(offers[i].buyer, refundAmount);
                }
            }
            if (isErc721) {
                delete offersErc721[tokenId];
            } else {
                delete offersErc1155[tokenId][listter];
            }
        }
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
