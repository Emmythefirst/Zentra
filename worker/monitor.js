const { createPublicClient, http, parseAbiItem } = require('viem');
const { defineChain } = require('viem');
const fs = require('fs');
const path = require('path');

// Load config and ABI
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const abi = JSON.parse(fs.readFileSync(path.join(__dirname, 'taskEscrowABI.json'), 'utf8'));

// Define Monad Testnet
const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] }
  },
  blockExplorers: {
    default: { name: 'MonadVision', url: 'https://testnet.monadvision.com' }
  }
});

// Create client
const client = createPublicClient({
  chain: monadTestnet,
  transport: http(config.rpcUrl)
});

// Last processed block
let lastBlock = null;

/**
 * Monitor TaskEscrow contract for new tasks
 */
async function monitorNewTasks(onTaskCreated) {
  try {
    const currentBlock = await client.getBlockNumber();
    
    // First run - set starting block
    if (!lastBlock) {
      lastBlock = currentBlock - 75n; // Look back 100 blocks on first run
      console.log(`[MONITOR] Starting from block ${lastBlock}`);
    }

    // Get TaskCreated events
    const logs = await client.getLogs({
      address: config.contractAddress,
      event: parseAbiItem('event TaskCreated(uint256 indexed taskId, address indexed employer, uint256 payment, address token, string description)'),
      fromBlock: lastBlock + 1n,
      toBlock: lastBlock + 1n + 74n < currentBlock ? lastBlock + 1n + 74n : currentBlock
    });

    console.log(`[MONITOR] Checked blocks ${lastBlock + 1n} to ${currentBlock}, found ${logs.length} events`);

    // Process each new task
    for (const log of logs) {
      const { taskId, employer, description, payment, token } = log.args;
      
      console.log(`[MONITOR] New task detected!`);
      console.log(`  Task ID: ${taskId}`);
      console.log(`  Employer: ${employer}`);
      console.log(`  Description: ${description}`);
      console.log(`  Payment: ${payment} wei`);
      
      // Callback to handle new task
      if (onTaskCreated) {
        await onTaskCreated({
          taskId: Number(taskId),
          employer,
          description,
          payment: payment.toString(),
          token
        });
      }
    }

    // Update last processed block
    lastBlock = currentBlock;

  } catch (error) {
    console.error('[MONITOR] Error monitoring tasks:', error.message);
  }
}

/**
 * Get all open tasks from contract
 */
async function getOpenTasks() {
  try {
    const tasks = await client.readContract({
      address: config.contractAddress,
      abi: abi,
      functionName: 'getTasks'
    });

    // Filter for OPEN status (status = 0)
    const openTasks = tasks.filter(task => task.status === 0);
    
    return openTasks.map(task => ({
      taskId: Number(task.taskId),
      employer: task.employer,
      worker: task.worker,
      description: task.description,
      payment: task.payment.toString(),
      status: task.status,
      proofUrl: task.proofUrl
    }));
  } catch (error) {
    console.error('[MONITOR] Error getting open tasks:', error.message);
    return [];
  }
}

module.exports = {
  monitorNewTasks,
  getOpenTasks
};
