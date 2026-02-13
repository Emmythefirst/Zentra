// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import Script from forge-std (comes with Foundry)
import {Script} from "forge-std/Script.sol";

// Import your TaskEscrow contract
import {TaskEscrow} from "../src/TaskEscrow.sol";

// Your deployment script
contract DeployScript is Script {
    
    // This function runs when you execute the script
    function run() external {
        
        // Get private key from .env file
        // vm.envUint reads PRIVATE_KEY as a number
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get platform wallet address from .env file
        // vm.envAddress reads PLATFORM_WALLET as an address
        address platformWallet = vm.envAddress("PLATFORM_WALLET");
        
        // START BROADCASTING TRANSACTIONS
        // Everything between startBroadcast and stopBroadcast
        // will be sent to the blockchain
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the TaskEscrow contract
        // This is like: new TaskEscrow(platformWallet)
        TaskEscrow escrow = new TaskEscrow(platformWallet);
        
        // STOP BROADCASTING
        vm.stopBroadcast();
        
        // The contract is now deployed!
        // The address is stored in: address(escrow)
    }
}