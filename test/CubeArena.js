const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CubeArena", function () {
  async function deployFixture() {
    const [owner, alice] = await ethers.getSigners();
    const CubeArena = await ethers.getContractFactory("CubeArena");
    const game = await CubeArena.deploy();
    await game.waitForDeployment();
    return { game, owner, alice };
  }

  it("registers player with exact fee", async function () {
    const { game, alice } = await deployFixture();
    const fee = await game.REGISTRATION_FEE();

    await expect(game.connect(alice).register({ value: fee }))
      .to.emit(game, "Registered");

    const cube = await game.cubes(alice.address);
    expect(cube.registered).to.equal(true);
  });

  it("rejects invalid move and allows valid move", async function () {
    const { game, alice } = await deployFixture();
    const fee = await game.REGISTRATION_FEE();
    await game.connect(alice).register({ value: fee });

    await expect(game.connect(alice).move(1, 1)).to.be.revertedWithCustomError(game, "InvalidMove");
    await expect(game.connect(alice).move(1, 0)).to.emit(game, "Moved");
  });

  it("enforces cooldown between moves", async function () {
    const { game, alice } = await deployFixture();
    const fee = await game.REGISTRATION_FEE();
    await game.connect(alice).register({ value: fee });

    const cube = await game.cubes(alice.address);
    const x = Number(cube.x);
    const y = Number(cube.y);

    const [dx, dy] = x > 0 ? [-1, 0] : [1, 0];
    await game.connect(alice).move(dx, dy);

    const nextMove = y > 0 ? [0, -1] : [0, 1];
    await expect(game.connect(alice).move(...nextMove)).to.be.revertedWithCustomError(game, "CooldownActive");
  });
});
