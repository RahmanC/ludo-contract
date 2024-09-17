// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Ludo {
    // State variables
    uint256 private nonce;
    address public gameOwner;
    mapping(address => uint256) public playerPositions;
    address[] public players;
    uint256 public currentPlayerIndex;
    uint8 public constant BOARD_SIZE = 52;

    // Events
    event DiceRolled(address player, uint8 roll);
    event PlayerMoved(address player, uint256 newPosition);
    event GameWon(address winner);

    constructor() {
        gameOwner = msg.sender;
        nonce = 0;
    }

    function joinGame() public {
        require(players.length < 4, "Game is full");
        require(playerPositions[msg.sender] == 0, "Player already in game");
        players.push(msg.sender);
        playerPositions[msg.sender] = 1;
    }

    function rollDice() public returns (uint8) {
        require(msg.sender == players[currentPlayerIndex], "Not your turn");
        
        // Pseudorandom number generation
        uint8 roll = uint8((uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % 6) + 1);
        nonce++;

        emit DiceRolled(msg.sender, roll);
        movePlayer(roll);
        return roll;
    }

    function movePlayer(uint8 roll) private {
        uint256 newPosition = playerPositions[msg.sender] + roll;
        
        if (newPosition > BOARD_SIZE) {
            newPosition = BOARD_SIZE - (newPosition - BOARD_SIZE);
        }

        playerPositions[msg.sender] = newPosition;
        emit PlayerMoved(msg.sender, newPosition);

        if (newPosition == BOARD_SIZE) {
            emit GameWon(msg.sender);
        } else {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        }
    }

   
}