import { expect } from "chai";
import { ethers } from "hardhat";
import { Ludo, Ludo__factory } from "../typechain-types";

describe("Ludo", function () {
  let Ludo: Ludo__factory;
  let ludo: Ludo;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;
  let addr4: any;
  let addrs: any[];

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Ludo = (await ethers.getContractFactory("Ludo")) as Ludo__factory;
    [owner, addr1, addr2, addr3, addr4, ...addrs] = await ethers.getSigners();

    // Deploy a new LudoGame contract before each test
    ludo = await Ludo.deploy();
    await ludo.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ludo.gameOwner()).to.equal(owner.address);
    });
  });

  describe("Joining the game", function () {
    it("Should allow up to 4 players to join", async function () {
      await ludo.connect(addr1).joinGame();
      await ludo.connect(addr2).joinGame();
      await ludo.connect(addr3).joinGame();
      await ludo.connect(addr4).joinGame();

      await expect(ludo.connect(addrs[0]).joinGame()).to.be.revertedWith(
        "Game is full"
      );
    });

    it("Should not allow a player to join twice", async function () {
      await ludo.connect(addr1).joinGame();
      await expect(ludo.connect(addr1).joinGame()).to.be.revertedWith(
        "Player already in game"
      );
    });
  });

  describe("Rolling the dice", function () {
    beforeEach(async function () {
      await ludo.connect(addr1).joinGame();
      await ludo.connect(addr2).joinGame();
    });

    it("Should only allow the current player to roll", async function () {
      await expect(ludo.connect(addr2).rollDice()).to.be.revertedWith(
        "Not your turn"
      );
    });
  });

  describe("Moving the player", function () {
    beforeEach(async function () {
      await ludo.connect(addr1).joinGame();
      await ludo.connect(addr2).joinGame();
    });

    it("Should update player position after rolling", async function () {
      await ludo.connect(addr1).rollDice();
      const newPosition = await ludo.playerPositions(addr1.address);
      expect(newPosition).to.be.above(1).and.to.be.below(8); // Initial position (1) + roll (1-6)
    });

    it("Should change turns after a move", async function () {
      await ludo.connect(addr1).rollDice();
      await expect(ludo.connect(addr1).rollDice()).to.be.revertedWith(
        "Not your turn"
      );
      await expect(ludo.connect(addr2).rollDice()).to.not.be.reverted;
    });
  });

  describe("Winning the game", function () {
    it("Should emit GameWon event when a player reaches the final position", async function () {
      await ludo.connect(addr1).joinGame();

      // The next roll should win the game
      await expect(ludo.connect(addr1).rollDice())
        .to.emit(ludo, "GameWon")
        .withArgs(addr1.address);
    });
  });
});
