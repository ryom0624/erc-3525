import { BigNumber } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC3525BurnableUpgradeable } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ERC3525 Mock", function () {
  let contract: ERC3525BurnableUpgradeable;
  let owner: SignerWithAddress, minter1: SignerWithAddress, minter2: SignerWithAddress, receiver: SignerWithAddress;

  beforeEach(async () => {
    const Contract = await ethers.getContractFactory("ERC3525BurnableUpgradeable");
    contract = (await Contract.deploy()) as ERC3525BurnableUpgradeable;

    [owner, minter1, minter2, receiver] = await ethers.getSigners();
  });

  // before(async () => {
  //   console.log(minter1.address);
  //   console.log(minter2.address);
  //   console.log(receiver.address);
  // });

  it("variables", async () => {
    await contract.mint(minter1.address, "100", 10000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);
    console.log("ownedTokensByAddress");
    console.log(await contract.ownedTokensByAddress(minter1.address));
    console.log(await contract.ownedTokensByAddress(minter2.address));

    console.log("ownedTokenIndexByAddress");
    console.log(await contract.ownedTokenIndexByAddress(minter1.address, 1));
    console.log(await contract.ownedTokenIndexByAddress(minter2.address, 2));
    console.log(await contract.ownedTokenIndexByAddress(minter2.address, 3));
    console.log(await contract.ownedTokenIndexByAddress(minter2.address, 4));
    console.log(await contract.ownedTokenIndexByAddress(minter2.address, 5));
    console.log(await contract.ownedTokenIndexByAddress(receiver.address, 1));
  });

  it("mint", async () => {
    /*
      tokenId: 1,
      slot: 100
      value: 10000
    */

    await contract.mint(minter1.address, "100", 10000);
    expect(await contract.ownerOf(1)).to.be.equal(minter1.address);
    expect(await contract["balanceOf(address)"](minter1.address)).to.be.equal(1);
    expect(await contract["balanceOf(uint256)"](1)).to.be.equal(10000);
    await expect(contract["balanceOf(uint256)"](2)).to.be.reverted;
    expect(await contract.slotOf(1)).to.be.equal(100);

    /*
      tokenId: 1,
      slot: 100,
      value: 10000
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2
    */
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);
    expect(await contract.ownerOf(2)).to.be.equal(minter2.address);
    expect(await contract["balanceOf(address)"](minter2.address)).to.be.equal(2);
    expect(await contract["balanceOf(uint256)"](2)).to.be.equal(15000);
    expect(await contract["balanceOf(uint256)"](3)).to.be.equal(15000);
    expect(await contract.slotOf(1)).to.be.equal(100);
    expect(await contract.slotOf(2)).to.be.equal(200);
    expect(await contract.slotOf(2)).to.be.equal(200);
  });

  it("safeTransferFrom from -> to", async () => {
    await contract.mint(minter1.address, "100", 10000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);

    /*
      tokenId: 1,
      slot: 100,
      value: 10000
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2
    */

    await contract.connect(minter1)["safeTransferFrom(address,address,uint256)"](minter1.address, receiver.address, 1);
    await contract.connect(minter2)["safeTransferFrom(address,address,uint256)"](minter2.address, receiver.address, 2);

    /*
      tokenId: 1,
      slot: 100,
      value: 10000
      owner: minter1 → receiver

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2 → receiver

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2
    */
    expect(await contract.ownerOf(1)).to.be.equal(receiver.address);
    expect(await contract.ownerOf(2)).to.be.equal(receiver.address);

    expect(await contract["balanceOf(address)"](minter1.address)).to.be.equal(0);
    expect(await contract["balanceOf(address)"](minter2.address)).to.be.equal(1);
    expect(await contract["balanceOf(address)"](receiver.address)).to.be.equal(2); // 1, 2

    expect(await contract["balanceOf(uint256)"](1)).to.be.equal(10000);
    expect(await contract["balanceOf(uint256)"](2)).to.be.equal(15000);
    expect(await contract["balanceOf(uint256)"](3)).to.be.equal(15000);

    expect(await contract.slotOf(1)).to.be.equal(100);
    expect(await contract.slotOf(2)).to.be.equal(200);
    expect(await contract.slotOf(3)).to.be.equal(200);

    // console.log("*** AfterTransfer ***");
    // console.log("*** allTokensByTokenId ***");
    // console.log((await contract.allTokensByTokenId(0)).id);
    // console.log((await contract.allTokensByTokenId(0)).owner);
    // console.log((await contract.allTokensByTokenId(1)).id);
    // console.log((await contract.allTokensByTokenId(1)).owner);
    // console.log((await contract.allTokensByTokenId(2)).id);
    // console.log((await contract.allTokensByTokenId(2)).owner);

    // console.log("*** allTokensIndex ***");
    // console.log(await contract.allTokensIndex(0));
    // console.log(await contract.allTokensIndex(1));
    // console.log(await contract.allTokensIndex(2));
  });

  it("transferFrom from -> to value", async () => {
    await contract.mint(minter1.address, "100", 10000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);

    /*
      tokenId: 1,
      slot: 100,
      value: 10000
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2
    */

    // await contract.connect(minter1)["approve(uint256,address,uint256)"](1, receiver.address, 50);
    await contract.connect(minter1)["transferFrom(uint256,address,uint256)"](1, receiver.address, 50);

    /*
      tokenId: 1,
      slot: 100,
      value: 9950
      owner: minter1 → 10000 → 9950

      tokenId: 2,
      slot: 200,
      value: 15000 → 15050
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 4,
      slot: 100,
      value: 50
      owner: receiver
      */
    // console.log(await contract.allTokens());

    expect(await contract.ownerOf(1)).to.be.equal(minter1.address);
    expect(await contract.ownerOf(2)).to.be.equal(minter2.address);
    expect(await contract.ownerOf(3)).to.be.equal(minter2.address);
    expect(await contract.ownerOf(4)).to.be.equal(receiver.address);

    expect(await contract["balanceOf(address)"](minter1.address)).to.be.equal(1);
    expect(await contract["balanceOf(address)"](minter2.address)).to.be.equal(2);
    expect(await contract["balanceOf(address)"](receiver.address)).to.be.equal(1);

    expect(await contract["balanceOf(uint256)"](1)).to.be.equal(9950);
    expect(await contract["balanceOf(uint256)"](2)).to.be.equal(15000);
    expect(await contract["balanceOf(uint256)"](3)).to.be.equal(15000);
    expect(await contract["balanceOf(uint256)"](4)).to.be.equal(50);

    expect(await contract.slotOf(1)).to.be.equal(100);
    expect(await contract.slotOf(2)).to.be.equal(200);
    expect(await contract.slotOf(3)).to.be.equal(200);
  });

  it("transferFrom fromTokenID -> toTokenID value same owner", async () => {
    await contract.mint(minter1.address, "100", 10000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);

    /*
      tokenId: 1,
      slot: 100,
      value: 10000
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2
    */

    // await contract.connect(minter1)["approve(uint256,address,uint256)"](1, receiver.address, 50);
    await contract.connect(minter2)["transferFrom(uint256,uint256,uint256)"](2, 3, 50);

    /*
      tokenId: 1,
      slot: 100,
      value: 9950
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000 → 14950
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000 → 15050
      owner: minter2
    */

    // console.log(await contract.allTokens());

    expect(await contract.ownerOf(1)).to.be.equal(minter1.address);
    expect(await contract.ownerOf(2)).to.be.equal(minter2.address);
    expect(await contract.ownerOf(3)).to.be.equal(minter2.address);

    expect(await contract["balanceOf(address)"](minter1.address)).to.be.equal(1);
    expect(await contract["balanceOf(address)"](minter2.address)).to.be.equal(2);

    expect(await contract["balanceOf(uint256)"](1)).to.be.equal(10000);
    expect(await contract["balanceOf(uint256)"](2)).to.be.equal(14950);
    expect(await contract["balanceOf(uint256)"](3)).to.be.equal(15050);

    expect(await contract.slotOf(1)).to.be.equal(100);
    expect(await contract.slotOf(2)).to.be.equal(200);
    expect(await contract.slotOf(3)).to.be.equal(200);
  });

  it("transferFrom fromTokenID -> toTokenID value another owner", async () => {
    const minter3: SignerWithAddress = (await ethers.getSigners())[4];

    await contract.mint(minter1.address, "100", 10000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter3.address, "200", 10);

    /*
      tokenId: 1,
      slot: 100,
      value: 10000
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 4,
      slot: 200,
      value: 10
      owner: minter3
    */

    // await contract.connect(minter1)["approve(uint256,address,uint256)"](1, receiver.address, 50);
    await contract.connect(minter2)["transferFrom(uint256,uint256,uint256)"](3, 4, 50);

    /*
      tokenId: 1,
      slot: 100,
      value: 9950
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000  → 14950
      owner: minter2

      tokenId: 4,
      slot: 200,
      value: 10 → 60
      owner: minter3

    */

    // console.log(await contract.allTokens());

    expect(await contract.ownerOf(1)).to.be.equal(minter1.address);
    expect(await contract.ownerOf(2)).to.be.equal(minter2.address);
    expect(await contract.ownerOf(3)).to.be.equal(minter2.address);
    expect(await contract.ownerOf(4)).to.be.equal(minter3.address);

    expect(await contract["balanceOf(address)"](minter1.address)).to.be.equal(1);
    expect(await contract["balanceOf(address)"](minter2.address)).to.be.equal(2);
    expect(await contract["balanceOf(address)"](minter3.address)).to.be.equal(1);
    expect(await contract["balanceOf(address)"](receiver.address)).to.be.equal(0);

    expect(await contract["balanceOf(uint256)"](1)).to.be.equal(10000);
    expect(await contract["balanceOf(uint256)"](2)).to.be.equal(15000);
    expect(await contract["balanceOf(uint256)"](3)).to.be.equal(14950);
    expect(await contract["balanceOf(uint256)"](4)).to.be.equal(60);

    expect(await contract.slotOf(1)).to.be.equal(100);
    expect(await contract.slotOf(2)).to.be.equal(200);
    expect(await contract.slotOf(3)).to.be.equal(200);
  });

  it("transferFrom fromTokenID -> toTokenID value same owner another slot", async () => {
    await contract.mint(minter1.address, "100", 10000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);

    /*
      tokenId: 1,
      slot: 100,
      value: 10000
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2
    */

    await expect(contract.connect(minter1)["transferFrom(uint256,uint256,uint256)"](1, 2, 50)).to.revertedWith(
      "ERC3535: transfer to token with different slot"
    );
  });

  it("transferFrom fromTokenID -> toTokenID value another owner", async () => {
    const minter3: SignerWithAddress = (await ethers.getSigners())[4];

    await contract.mint(minter1.address, "100", 10000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter2.address, "200", 15000);
    await contract.mint(minter3.address, "200", 10);

    /*
      tokenId: 1,
      slot: 100,
      value: 10000
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 4,
      slot: 200,
      value: 10
      owner: minter3
    */

    // await contract.connect(minter1)["approve(uint256,address,uint256)"](1, receiver.address, 50);
    await contract.connect(minter2)["transferFrom(uint256,uint256,uint256)"](3, 4, 50);

    /*
      tokenId: 1,
      slot: 100,
      value: 9950
      owner: minter1

      tokenId: 2,
      slot: 200,
      value: 15000 → 14950
      owner: minter2

      tokenId: 3,
      slot: 200,
      value: 15000
      owner: minter2

      tokenId: 4,
      slot: 200,
      value: 60
      owner: minter3

    */

    // console.log(await contract.allTokens());

    expect(await contract.ownerOf(1)).to.be.equal(minter1.address);
    expect(await contract.ownerOf(2)).to.be.equal(minter2.address);
    expect(await contract.ownerOf(3)).to.be.equal(minter2.address);
    expect(await contract.ownerOf(4)).to.be.equal(minter3.address);

    expect(await contract["balanceOf(address)"](minter1.address)).to.be.equal(1);
    expect(await contract["balanceOf(address)"](minter2.address)).to.be.equal(2);
    expect(await contract["balanceOf(address)"](minter3.address)).to.be.equal(1);
    expect(await contract["balanceOf(address)"](receiver.address)).to.be.equal(0);

    expect(await contract["balanceOf(uint256)"](1)).to.be.equal(10000);
    expect(await contract["balanceOf(uint256)"](2)).to.be.equal(15000);
    expect(await contract["balanceOf(uint256)"](3)).to.be.equal(14950);
    expect(await contract["balanceOf(uint256)"](4)).to.be.equal(60);

    expect(await contract.slotOf(1)).to.be.equal(100);
    expect(await contract.slotOf(2)).to.be.equal(200);
    expect(await contract.slotOf(3)).to.be.equal(200);
    expect(await contract.slotOf(4)).to.be.equal(200);
  });
});
