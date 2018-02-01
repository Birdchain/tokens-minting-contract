const expect = require('chai').expect;
const BirdCoinCrowdsale = artifacts.require('./BirdCoinCrowdsale.sol');
const BirdCoinContract = artifacts.require('./BirdCoin.sol');

contract('BirdCoinCrowdsale', (/* accounts */) => {
    it('Is token allocation for a specific address correct', async () => {
        const c = await BirdCoinCrowdsale.deployed();
        const BirdCoin = BirdCoinContract.at(await c.token());
        const acc = web3.eth.accounts;

        async function balanceOfTokens(acc) {
            return Number(web3.fromWei(await BirdCoin.balanceOf(acc), 'ether'))
        }

        const birdsBefore = await balanceOfTokens(acc[2]);

        const birdAmountToSend = 1000000000000000000;
        await c.allocateTokens(acc[2], birdAmountToSend, {from: acc[1]});

        const birdsAfter = await balanceOfTokens(acc[2]);

        expect(Number(await c.tokensAllocated())).to.equal(birdAmountToSend);
        expect(birdsBefore).to.not.equal(birdsAfter);
        expect(birdAmountToSend).to.equal(Number(web3.toWei(birdsAfter, 'ether')));

        //console.log("Total raised(birds): " + await c.tokensAllocated() + " Before(eth): " + birdsBefore + " After(eth): " + birdsAfter);
    });

    it('Only allocator can call allocateTokens function', async () => {
        const c = await BirdCoinCrowdsale.deployed();
        const BirdCoin = BirdCoinContract.at(await c.token());
        const acc = web3.eth.accounts;

        const birdAmountToSend = 1000000000000000000;
        await c.allocateTokens(acc[2], birdAmountToSend, {from: acc[1]});
        await c.allocateTokens(acc[2], birdAmountToSend, {from: acc[0]}).catch(() => {
            console.log("Only allocator can call this function!")
        });
    });

    it('Check if tokens are locked before unlockTokens() and unlocks after unlockTokens()', async () => {
        const c = await BirdCoinCrowdsale.deployed();
        const BirdCoin = BirdCoinContract.at(await c.token());
        const acc = web3.eth.accounts;
        const birdAmountToSend = 1000000000000000000;

        async function balanceOfTokens(acc) {
            return Number(web3.fromWei(await BirdCoin.balanceOf(acc), 'ether'))
        }

        await c.allocateTokens(acc[10], birdAmountToSend, {from: acc[1]});

        await BirdCoin.transfer(acc[3], birdAmountToSend, {from: acc[10]}).catch(() => {
            console.log("Tokens are locked before unlockTokens()!")
        });

        await c.unlockTokens();

        const sendersBirdsBeforeTransfer = await balanceOfTokens(acc[10]);
        const receiversBirdsBeforeTransfer = await balanceOfTokens(acc[3]);

        await BirdCoin.transfer(acc[3], birdAmountToSend, {from: acc[10]});

        const sendersBirdsAfterTransfer = await balanceOfTokens(acc[10]);
        const receiversBirdsAfterTransfer = await balanceOfTokens(acc[3]);

        expect(birdAmountToSend).to.equal(Number(web3.toWei(sendersBirdsBeforeTransfer, 'ether')));
        expect(sendersBirdsAfterTransfer).to.equal(0);
        expect(receiversBirdsBeforeTransfer).to.equal(0);
        expect(sendersBirdsBeforeTransfer).to.equal(receiversBirdsAfterTransfer);
    });

    it('Check if CAP is reached successfully', async () => {
        const c = await BirdCoinCrowdsale.deployed();
        const BirdCoin = BirdCoinContract.at(await c.token());
        const acc = web3.eth.accounts;

        const birdAmountToSend = 100000000000000000000;
        const CAP = Number(web3.fromWei(await c.CAP(), 'ether'));

        for (let i=11; i<50; i++) {
            await c.allocateTokens(acc[i], birdAmountToSend, {from: acc[1]});
            let total = Number(web3.fromWei(await c.tokensAllocated(), 'ether'));

            if (CAP <= total+birdAmountToSend) {
                break;
            }
        }
    });
});