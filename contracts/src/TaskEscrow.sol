// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaskEscrow {
    
    struct Task {
        uint256 taskId;
        address employer;
        address worker;
        uint256 payment;
        string description;
        string proofUrl;
        TaskStatus status;
    }
    
    enum TaskStatus { OPEN, ACCEPTED, SUBMITTED, COMPLETED, CANCELLED }
    
    uint256 public constant PLATFORM_FEE = 5;
    address public platformWallet;
    uint256 public taskCounter;
    
    mapping(uint256 => Task) public tasks;
    
    event TaskCreated(uint256 indexed taskId, address indexed employer, uint256 payment, string description);
    event TaskAccepted(uint256 indexed taskId, address indexed worker);
    event WorkSubmitted(uint256 indexed taskId, string proofUrl);
    event PaymentReleased(uint256 indexed taskId, address indexed worker, uint256 amount);
    
    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }
    
    function createTask(string memory _description) external payable {
        require(msg.value > 0, "Payment required");
        
        tasks[taskCounter] = Task({
            taskId: taskCounter,
            employer: msg.sender,
            worker: address(0),
            payment: msg.value,
            description: _description,
            proofUrl: "",
            status: TaskStatus.OPEN
        });
        
        emit TaskCreated(taskCounter, msg.sender, msg.value, _description);
        taskCounter++;
    }
    
    function acceptTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.employer != address(0), "Task does not exist");
        require(task.status == TaskStatus.OPEN, "Task not available");
        require(task.employer != msg.sender, "Cannot accept your own task");
        
        task.worker = msg.sender;
        task.status = TaskStatus.ACCEPTED;
        emit TaskAccepted(_taskId, msg.sender);
    }
    
    function submitWork(uint256 _taskId, string memory _proofUrl) external {
        Task storage task = tasks[_taskId];
        require(task.worker == msg.sender, "Not assigned to you");
        require(task.status == TaskStatus.ACCEPTED, "Task not accepted");
        require(bytes(_proofUrl).length > 0, "Proof URL required");
        
        task.proofUrl = _proofUrl;
        task.status = TaskStatus.SUBMITTED;
        emit WorkSubmitted(_taskId, _proofUrl);
    }
    
    function verifyAndRelease(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.employer == msg.sender, "Not the employer");
        require(task.status == TaskStatus.SUBMITTED, "Work not submitted yet");
        
        task.status = TaskStatus.COMPLETED;
        
        uint256 platformCut = (task.payment * PLATFORM_FEE) / 100;
        uint256 workerPayment = task.payment - platformCut;
        
        (bool successWorker, ) = payable(task.worker).call{value: workerPayment}("");
        require(successWorker, "Payment to worker failed");
        
        (bool successPlatform, ) = payable(platformWallet).call{value: platformCut}("");
        require(successPlatform, "Payment to platform failed");
        
        emit PaymentReleased(_taskId, task.worker, workerPayment);
    }
    
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