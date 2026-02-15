// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {ZenSubscription} from "../src/ZenSubscription.sol";

contract DeploySubscription is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address platformWallet     = vm.envAddress("PLATFORM_WALLET");
        address zenToken           = vm.envAddress("ZEN_TOKEN");

        vm.startBroadcast(deployerPrivateKey);

        ZenSubscription sub = new ZenSubscription(zenToken, platformWallet);

        vm.stopBroadcast();

        // Log the deployed address so you can copy it
        // forge script will print this in the output
        address(sub);
    }
}
