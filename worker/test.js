const { getOpenTasks } = require('./monitor');
const { canCompleteTask } = require('./executor');
const config = require('./config.json');

async function test() {
  console.log('🧪 Testing Zentra Worker...\n');
  
  // Test 1: Check configuration
  console.log('Test 1: Configuration');
  console.log('✓ Contract:', config.contractAddress);
  console.log('✓ Wallet:', config.walletAddress);
  console.log('✓ Capabilities:', config.capabilities.join(', '));
  console.log('');
  
  // Test 2: Get open tasks
  console.log('Test 2: Fetch Open Tasks');
  try {
    const tasks = await getOpenTasks();
    console.log(`✓ Found ${tasks.length} open tasks`);
    tasks.forEach(task => {
      console.log(`  - Task ${task.taskId}: ${task.description}`);
    });
  } catch (error) {
    console.log('✗ Error:', error.message);
  }
  console.log('');
  
  // Test 3: Task evaluation
  console.log('Test 3: Task Evaluation');
  const testTasks = [
    'Scrape top 10 products from Amazon',
    'Analyze customer data CSV file',
    'Summarize this article',
    'Research best practices for React',
    'Deploy a smart contract' // Should fail
  ];
  
  testTasks.forEach(desc => {
    const result = canCompleteTask(desc, config.capabilities);
    console.log(`  "${desc}"`);
    console.log(`    Can do: ${result.canDo ? '✓' : '✗'}, Type: ${result.type || 'N/A'}, Confidence: ${result.confidence}`);
  });
  
  console.log('\n✅ All tests completed!');
}

test().catch(console.error);
