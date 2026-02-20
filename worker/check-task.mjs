import { createPublicClient, http } from 'viem';

const chain = { id: 10143, name: 'Monad Testnet', nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 }, rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } };
const client = createPublicClient({ chain, transport: http('https://testnet-rpc.monad.xyz') });

const STATUS = ['OPEN', 'ACCEPTED', 'SUBMITTED', 'COMPLETED', 'CANCELLED'];

const abi = [{ name: 'getTask', type: 'function', stateMutability: 'view',
  inputs: [{ name: '_taskId', type: 'uint256' }],
  outputs: [{ name: '', type: 'tuple', components: [
    { name: 'taskId', type: 'uint256' }, { name: 'employer', type: 'address' },
    { name: 'worker', type: 'address' }, { name: 'payment', type: 'uint256' },
    { name: 'token', type: 'address' }, { name: 'description', type: 'string' },
    { name: 'proofUrl', type: 'string' }, { name: 'status', type: 'uint8' }
  ]}]
}];

for (let i = 5; i <= 7; i++) {
  try {
    const task = await client.readContract({
      address: '0xA0A261A70C0904142804CF20C752f67BA57236d1',
      abi, functionName: 'getTask', args: [BigInt(i)]
    });
    console.log(`Task ${i}: status=${STATUS[task.status]}, employer=${task.employer}, token=${task.token}`);
  } catch(e) {
    console.log(`Task ${i}: not found`);
  }
}
