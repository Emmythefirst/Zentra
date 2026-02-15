// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title ZenSubscription
/// @notice Manages ZEN-gated access to verified agents on Zentra
/// @dev Holders (10k+ ZEN) get 1 task/day tracked off-chain.
///      Subscribers spend 50k ZEN for 30 days unlimited access (tracked on-chain).
contract ZenSubscription {
    IERC20 public immutable zen;
    address public immutable platform;

    uint256 public constant SUBSCRIPTION_PRICE    = 50_000 * 1e18; // 50,000 ZEN
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;
    uint256 public constant HOLDER_THRESHOLD      = 10_000 * 1e18; // 10,000 ZEN

    // user => agentId (keccak256 hash) => expiresAt timestamp
    mapping(address => mapping(bytes32 => uint256)) public subscriptions;

    event Subscribed(
        address indexed user,
        bytes32 indexed agentId,
        uint256 expiresAt
    );

    constructor(address _zen, address _platform) {
        zen = IERC20(_zen);
        platform = _platform;
    }

    /// @notice Subscribe to a verified agent for 30 days.
    ///         If already subscribed, extends from current expiry.
    /// @param agentId keccak256 hash of the agent's string id
    function subscribe(bytes32 agentId) external {
        require(
            zen.transferFrom(msg.sender, platform, SUBSCRIPTION_PRICE),
            "ZEN transfer failed"
        );

        uint256 current = subscriptions[msg.sender][agentId];
        uint256 start = current > block.timestamp ? current : block.timestamp;
        uint256 expiry = start + SUBSCRIPTION_DURATION;

        subscriptions[msg.sender][agentId] = expiry;

        emit Subscribed(msg.sender, agentId, expiry);
    }

    /// @notice Check if a user has an active subscription to an agent
    function isSubscribed(address user, bytes32 agentId) external view returns (bool) {
        return subscriptions[user][agentId] > block.timestamp;
    }

    /// @notice Get subscription expiry timestamp (0 if never subscribed)
    function getExpiry(address user, bytes32 agentId) external view returns (uint256) {
        return subscriptions[user][agentId];
    }

    /// @notice Check if a user qualifies as a ZEN holder (for holder-tier access)
    function isHolder(address user) external view returns (bool) {
        return zen.balanceOf(user) >= HOLDER_THRESHOLD;
    }
}
