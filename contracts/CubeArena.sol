// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CubeArena {
    uint8 public constant GRID_SIZE = 10;
    uint256 public constant REGISTRATION_FEE = 0.0005 ether;
    uint256 public constant MOVE_COOLDOWN = 15 seconds;

    struct Cube {
        bool registered;
        uint8 x;
        uint8 y;
        uint32 moves;
        uint32 crystals;
        uint64 lastMoveAt;
    }

    mapping(address => Cube) public cubes;

    event Registered(address indexed player, uint8 x, uint8 y);
    event Moved(address indexed player, uint8 fromX, uint8 fromY, uint8 toX, uint8 toY, bool foundCrystal);

    error AlreadyRegistered();
    error NotRegistered();
    error WrongFee();
    error CooldownActive(uint256 readyAt);
    error InvalidMove();

    function register() external payable {
        Cube storage cube = cubes[msg.sender];
        if (cube.registered) revert AlreadyRegistered();
        if (msg.value != REGISTRATION_FEE) revert WrongFee();

        uint8 sx = uint8(uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp))) % GRID_SIZE);
        uint8 sy = uint8(uint256(keccak256(abi.encodePacked(msg.sender, block.prevrandao))) % GRID_SIZE);

        cubes[msg.sender] = Cube({
            registered: true,
            x: sx,
            y: sy,
            moves: 0,
            crystals: 0,
            lastMoveAt: uint64(block.timestamp - MOVE_COOLDOWN)
        });

        emit Registered(msg.sender, sx, sy);
    }

    function move(int8 dx, int8 dy) external {
        Cube storage cube = cubes[msg.sender];
        if (!cube.registered) revert NotRegistered();
        if (block.timestamp < cube.lastMoveAt + MOVE_COOLDOWN) {
            revert CooldownActive(cube.lastMoveAt + MOVE_COOLDOWN);
        }
        if ((dx == 0 && dy == 0) || (dx != 0 && dy != 0)) revert InvalidMove();
        if (dx > 1 || dx < -1 || dy > 1 || dy < -1) revert InvalidMove();

        int16 nx = int16(uint16(cube.x)) + int16(dx);
        int16 ny = int16(uint16(cube.y)) + int16(dy);

        if (nx < 0 || nx >= int16(uint16(GRID_SIZE)) || ny < 0 || ny >= int16(uint16(GRID_SIZE))) {
            revert InvalidMove();
        }

        uint8 fromX = cube.x;
        uint8 fromY = cube.y;
        cube.x = uint8(uint16(nx));
        cube.y = uint8(uint16(ny));
        cube.moves += 1;
        cube.lastMoveAt = uint64(block.timestamp);

        bool foundCrystal = _rollCrystal(msg.sender, cube.moves, cube.x, cube.y);
        if (foundCrystal) {
            cube.crystals += 1;
        }

        emit Moved(msg.sender, fromX, fromY, cube.x, cube.y, foundCrystal);
    }

    function leaderboardScore(address player) public view returns (uint256) {
        Cube memory c = cubes[player];
        if (!c.registered) return 0;
        return uint256(c.moves) + uint256(c.crystals) * 5;
    }

    function _rollCrystal(address player, uint32 moves, uint8 x, uint8 y) private view returns (bool) {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    player,
                    moves,
                    x,
                    y
                )
            )
        );
        return seed % 5 == 0;
    }
}
