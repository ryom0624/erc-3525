import { BigNumber } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC3525BurnableUpgradeable } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TokenData, ZERO_ADDRESS } from "./lib/constants";

describe("ERC3525", function () {
  const deploy = async (): Promise<ERC3525BurnableUpgradeable> => {
    const ERC3525Factory = await ethers.getContractFactory(
      "ERC3525BurnableUpgradeable"
    );
    const erc3525 =
      (await ERC3525Factory.deploy()) as ERC3525BurnableUpgradeable;
    await erc3525.deployed();
    return erc3525;
  };

  const mint = async (slot: string = "3525"): Promise<TokenData> => {
    const erc3525 = await deploy();
    const [minter] = await ethers.getSigners();
    return mintWithOutDeploy(erc3525, minter, slot);
  };

  const mintWithOutDeploy = async (
    erc3525: ERC3525BurnableUpgradeable,
    minter: SignerWithAddress,
    slot: string
  ): Promise<TokenData> => {
    const value = BigNumber.from("1000000000000000000");
    await erc3525.mint(minter.address, slot, value);

    let eventFilter = erc3525.filters["TransferValue"](0);
    let block = await ethers.provider.getBlock("latest");
    let event = await erc3525.queryFilter(eventFilter, block.number, "latest");
    let args = event[0]["args"];
    const tokenData = {
      id: BigNumber.from(args[1]),
      slot: BigNumber.from(slot),
      balance: value,
      owner: minter.address,
      erc3525: erc3525,
    };

    return tokenData;
  };

  const checkTransferEvent = async (
    erc3525: ERC3525BurnableUpgradeable,
    from: string,
    to: string,
    tokenId: BigNumber
  ) => {
    let eventFilter = erc3525.filters["Transfer"](from, to);
    let block = await ethers.provider.getBlock("latest");
    let event = await erc3525.queryFilter(eventFilter, block.number, "latest");

    let args = event[0]["args"];
    expect(args[0]).to.equal(from);
    expect(args[1]).to.equal(to);
    expect(args[2]).to.equal(tokenId);
  };

  const checkTransferValueEvent = async (
    erc3525: ERC3525BurnableUpgradeable,
    fromTokenId: BigNumber,
    toTokenId: BigNumber,
    balance: BigNumber
  ) => {
    let eventFilter = erc3525.filters["TransferValue"](fromTokenId, toTokenId);
    let block = await ethers.provider.getBlock("latest");
    let event = await erc3525.queryFilter(eventFilter, block.number, "latest");
    let args = event[0]["args"];
    expect(args[0]).to.equal(fromTokenId);
    expect(args[1]).to.equal(toTokenId);
    expect(args[2]).to.equal(balance);
  };

  describe("ERC721 compatible interface", function () {
    it("balance of address should be correct after transfer id", async () => {
      const erc3525 = await deploy();
      const [minter, receiver] = await ethers.getSigners();

      const tokenDatas = [];

      for (let i = 1; i < 11; i++) {
        const tokenData = await mintWithOutDeploy(erc3525, minter, "3525");
        tokenDatas.push(tokenData);
      }
      for (let i = 1; i < 11; i++) {
        const tokenData = await mintWithOutDeploy(erc3525, minter, "3236");
        tokenDatas.push(tokenData);
      }

      console.log(await erc3525.ownerOf(1));
      console.log(await erc3525["balanceOf(address)"](minter.address));
      console.log(await erc3525["balanceOf(uint256)"](1));
      console.log(await erc3525["balanceOf(uint256)"](2));
      console.log(await erc3525.slotOf(1));
      console.log(await erc3525.slotOf(11));

      // expect(await erc3525["balanceOf(address)"](minter.address)).to.eq(20);

      // for (let t of tokenDatas.slice(0, 4)) {
      //   await erc3525.burn(t.id);
      // }
      // expect(await erc3525["balanceOf(address)"](minter.address)).to.eq(16);

      // for (let t of tokenDatas.slice(5, 7)) {
      //   await erc3525["transferFrom(address,address,uint256)"](
      //     minter.address,
      //     receiver.address,
      //     t.id
      //   );
      // }
      // expect(await erc3525["balanceOf(address)"](minter.address)).to.eq(14);
    });
  });
});
