// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract TaskEscrow {

    struct Task {
        uint256 taskId;
        address employer;
        address worker;
        uint256 payment;
        address token;        // address(0) = native MON, else ERC20 (e.g. ZEN)
        string description;
        string proofUrl;
        TaskStatus status;
    }

    enum TaskStatus { OPEN, ACCEPTED, SUBMITTED, COMPLETED, CANCELLED }

    uint256 public constant PLATFORM_FEE = 5;
    address public platformWallet;
    uint256 public taskCounter;

    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 indexed taskId, address indexed employer, uint256 payment, address token, string description);
    event TaskAccepted(uint256 indexed taskId, address indexed worker);
    event WorkSubmitted(uint256 indexed taskId, string proofUrl);
    event PaymentReleased(uint256 indexed taskId, address indexed worker, uint256 amount, address token);

    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    // ─────────────────────────────────────────────
    // Create task with native MON
    // ─────────────────────────────────────────────
    function createTask(string memory _description) external payable {
        require(msg.value > 0, "Payment required");
        _storeTask(msg.value, address(0), _description);
    }

    // ─────────────────────────────────────────────
    // Create task with ERC20 token (e.g. ZEN)
    // Caller must approve this contract first:
    //   ZEN.approve(contractAddress, amount)
    // ─────────────────────────────────────────────
    function createTaskWithToken(
        string memory _description,
        address _token,
        uint256 _amount
    ) external {
        require(_token != address(0), "Use createTask() for MON");
        require(_amount > 0, "Payment required");

        bool success = IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");

        _storeTask(_amount, _token, _description);
    }

    function _storeTask(uint256 _payment, address _token, string memory _description) internal {
        tasks[taskCounter] = Task({
            taskId: taskCounter,
            employer: msg.sender,
            worker: address(0),
            payment: _payment,
            token: _token,
            description: _description,
            proofUrl: "",
            status: TaskStatus.OPEN
        });

        emit TaskCreated(taskCounter, msg.sender, _payment, _token, _description);
        taskCounter++;
    }

    // ─────────────────────────────────────────────
    // Accept task (unchanged)
    // ─────────────────────────────────────────────
    function acceptTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.employer != address(0), "Task does not exist");
        require(task.status == TaskStatus.OPEN, "Task not available");
        require(task.employer != msg.sender, "Cannot accept your own task");

        task.worker = msg.sender;
        task.status = TaskStatus.ACCEPTED;
        emit TaskAccepted(_taskId, msg.sender);
    }

    // ─────────────────────────────────────────────
    // Submit work (unchanged)
    // ─────────────────────────────────────────────
    function submitWork(uint256 _taskId, string memory _proofUrl) external {
        Task storage task = tasks[_taskId];
        require(task.worker == msg.sender, "Not assigned to you");
        require(task.status == TaskStatus.ACCEPTED, "Task not accepted");
        require(bytes(_proofUrl).length > 0, "Proof URL required");

        task.proofUrl = _proofUrl;
        task.status = TaskStatus.SUBMITTED;
        emit WorkSubmitted(_taskId, _proofUrl);
    }

    // ─────────────────────────────────────────────
    // Release payment — handles both MON and ERC20
    // ─────────────────────────────────────────────
    function verifyAndRelease(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.employer == msg.sender, "Not the employer");
        require(task.status == TaskStatus.SUBMITTED, "Work not submitted yet");

        task.status = TaskStatus.COMPLETED;

        uint256 platformCut = (task.payment * PLATFORM_FEE) / 100;
        uint256 workerPayment = task.payment - platformCut;

        if (task.token == address(0)) {
            // Native MON payment
            (bool successWorker, ) = payable(task.worker).call{value: workerPayment}("");
            require(successWorker, "Payment to worker failed");

            (bool successPlatform, ) = payable(platformWallet).call{value: platformCut}("");
            require(successPlatform, "Payment to platform failed");
        } else {
            // ERC20 token payment (ZEN)
            bool successWorker = IERC20(task.token).transfer(task.worker, workerPayment);
            require(successWorker, "Token payment to worker failed");

            bool successPlatform = IERC20(task.token).transfer(platformWallet, platformCut);
            require(successPlatform, "Token payment to platform failed");
        }

        emit PaymentReleased(_taskId, task.worker, workerPayment, task.token);
    }

    // ─────────────────────────────────────────────
    // Cancel task — refunds employer
    // ─────────────────────────────────────────────
    function cancelTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.employer == msg.sender, "Not the employer");
        require(task.status == TaskStatus.OPEN, "Can only cancel open tasks");

        task.status = TaskStatus.CANCELLED;

        if (task.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: task.payment}("");
            require(success, "Refund failed");
        } else {
            bool success = IERC20(task.token).transfer(msg.sender, task.payment);
            require(success, "Token refund failed");
        }
    }

    // ─────────────────────────────────────────────
    // View helpers (unchanged)
    // ─────────────────────────────────────────────
    function getTask(uint256 _taskId) external view returns (Task memory) {
        return tasks[_taskId];
    }

    function getTotalTasks() external view returns (uint256) {
        return taskCounter;
    }

    function isTaskAvailable(uint256 _taskId) external view returns (bool) {
        return tasks[_taskId].status == TaskStatus.OPEN &&
               tasks[_taskId].employer != address(0);
    }
}
