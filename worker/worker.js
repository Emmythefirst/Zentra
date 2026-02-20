#!/usr/bin/env node

const { monitorNewTasks, getOpenTasks } = require('./monitor');
const { canCompleteTask, executeTask, uploadProof } = require('./executor');
const { createWalletClient, http, parseAbi } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { defineChain } = require('viem');
const fs = require('fs');
const path = require('path');

// Load config
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

// Create wallet client
const account = privateKeyToAccount(config.walletPrivateKey);
const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(config.rpcUrl)
});

const processedTasks = new Set();

console.log(`[WORKER] Zentra Worker initialized`);
console.log(`[WORKER] Wallet: ${config.walletAddress}`);
console.log(`[WORKER] Contract: ${config.contractAddress}`);
console.log(`[WORKER] Capabilities: ${config.capabilities.join(', ')}`);

/**
 * Accept task on blockchain
 */
async function acceptTask(taskId) {
  try {
    console.log(`[WORKER] Accepting task ${taskId}...`);
    
    const hash = await walletClient.writeContract({
      address: config.contractAddress,
      abi: abi,
      functionName: 'acceptTask',
      args: [BigInt(taskId)]
    });
    
    console.log(`[WORKER] Task accepted! Tx: ${hash}`);
    return hash;
  } catch (error) {
    console.error(`[WORKER] Failed to accept task:`, error.message);
    throw error;
  }
}

/**
 * Submit work proof on blockchain
 */
async function submitWork(taskId, proofUrl) {
  try {
    console.log(`[WORKER] Submitting work for task ${taskId}...`);
    
    const hash = await walletClient.writeContract({
      address: config.contractAddress,
      abi: abi,
      functionName: 'submitWork',
      args: [BigInt(taskId), proofUrl]
    });
    
    console.log(`[WORKER] Work submitted! Tx: ${hash}`);
    return hash;
  } catch (error) {
    console.error(`[WORKER] Failed to submit work:`, error.message);
    throw error;
  }
}

/**
 * Handle new task
 */
async function handleNewTask(task) {
  try {
    // Skip if already processed
    if (processedTasks.has(task.taskId)) {
      return;
    }
    processedTasks.add(task.taskId);

    console.log(`\n[WORKER] ========== NEW TASK ==========`);
    console.log(`[WORKER] Task ID: ${task.taskId}`);
    console.log(`[WORKER] Description: ${task.description}`);
    console.log(`[WORKER] Payment: ${task.payment} wei`);
    
    // Evaluate if we can do this task
    const evaluation = canCompleteTask(task.description, config.capabilities);
    
    if (!evaluation.canComplete) {
      console.log(`[WORKER] ❌ Cannot complete this task (no matching capability)`);
      return;
    }
    
    console.log(`[WORKER] ✅ Can complete! Type: ${evaluation.type}, Confidence: ${evaluation.confidence}`);
    
    // Check if already accepted by us, if not accept it
    if (task.status !== 1) {
      await acceptTask(task.taskId);
    } else {
      console.log(`[WORKER] Task already accepted, proceeding to execute...`);
    }
    console.log(`[WORKER] ⏳ Waiting 10 seconds for transaction confirmation...`);
    await sleep(10000);
    
    // Execute the work
    console.log(`[WORKER] 🔨 Executing work...`);
    const proofUrl = await executeTask(task.taskId, task.description);
    
    
    // Submit work on-chain
    await submitWork(task.taskId, proofUrl);
    console.log(`[WORKER] ⏳ Waiting 10 seconds for transaction confirmation...`);
    await sleep(10000);
    
    console.log(`[WORKER] 🎉 Task ${task.taskId} completed successfully!`);
    console.log(`[WORKER] ===================================\n`);
    
  } catch (error) {
    console.error(`[WORKER] ❌ Error handling task ${task.taskId}:`, error.message);
  }
}

/**
 * Main worker loop
 */
async function startWorker() {
  console.log(`\n[WORKER] 🚀 Starting autonomous worker...`);
  console.log(`[WORKER] Polling interval: ${config.pollingInterval / 1000}s\n`);
  
  // Monitor for new tasks
  setInterval(async () => {
    await monitorNewTasks(handleNewTask);
  }, config.pollingInterval);
  
  // Initial check
  await monitorNewTasks(handleNewTask);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the worker
if (require.main === module) {
  startWorker().catch(console.error);
}

module.exports = {
  startWorker,
  acceptTask,
  submitWork
};
