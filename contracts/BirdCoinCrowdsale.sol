pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./BirdCoin.sol";

contract BirdCoinCrowdsale is Ownable {
    using SafeMath for uint256;

    address constant ALLOCATOR_WALLET = 0xb958b63fe19fefb721ac6d98e5ccfce88986ae80;
    uint256 constant public CAP = 2000 ether;
    BirdCoin public token;

    bool public areTokensUnlocked = false;
    uint256 public tokensAllocated;

    event TokenPurchase(address indexed beneficiary, uint256 amount);

    modifier onlyAllocator() {
        require(msg.sender == ALLOCATOR_WALLET);
        _;
    }

    /******************************* Constructor  ********************************/

    function BirdCoinCrowdsale() {
        token = new BirdCoin();
    }

    /**************************** Token allocation  *****************************/

    function allocateTokens(address addr, uint256 tokenAmount) public onlyAllocator {
        require(validPurchase(tokenAmount));
        tokensAllocated = tokensAllocated.add(tokenAmount);
        token.mint(addr, tokenAmount);
        TokenPurchase(msg.sender, tokenAmount);
    }

    function validPurchase(uint256 providedAmount) internal constant returns (bool) {
        bool isCapReached = tokensAllocated.add(providedAmount) > CAP;

        if (isCapReached) {
            token.finishMinting();
        }

        return !isCapReached;
    }

    /******************************* Token unlock  ********************************/

    function unlockTokens() onlyOwner public {
        require(!areTokensUnlocked);
        token.unlockTokens();
        areTokensUnlocked = true;
    }
}
