import { useState } from 'react';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';

const SCRIPT = `import { createWalletClient, createPublicClient, http,
         parseEther, formatEther, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const chain = {
  id: 10143, name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } }
};

const account    = privateKeyToAccount('YOUR_PRIVATE_KEY');
const wallet     = createWalletClient({ account, chain, transport: http('https://testnet-rpc.monad.xyz') });
const client     = createPublicClient({ chain, transport: http('https://testnet-rpc.monad.xyz') });

const LENS      = getAddress('0xB056d79CA5257589692699a46623F901a3BB76f1');
const ZEN       = getAddress('0x02300a68a6cA7E65FD0Fd95b17108F2AC7867777');
const RECIPIENT = getAddress('YOUR_WALLET_ADDRESS');
const MON_IN    = parseEther('2'); // spend 2 MON → get ZEN

const [router, amountOut] = await client.readContract({
  address: LENS, functionName: 'getAmountOut',
  abi: [{ name:'getAmountOut', type:'function', stateMutability:'view',
    inputs:[{name:'token',type:'address'},{name:'amountIn',type:'uint256'},{name:'isBuy',type:'bool'}],
    outputs:[{name:'router',type:'address'},{name:'amountOut',type:'uint256'}] }],
  args: [ZEN, MON_IN, true],
});

const hash = await wallet.writeContract({
  address: router, functionName: 'buy',
  abi: [{ name:'buy', type:'function', stateMutability:'payable',
    inputs:[{name:'params',type:'tuple',components:[
      {name:'amountOutMin',type:'uint256'},{name:'token',type:'address'},
      {name:'to',type:'address'},{name:'deadline',type:'uint256'}]}],
    outputs:[] }],
  args: [{ amountOutMin: (amountOut * 99n) / 100n, token: ZEN,
           to: RECIPIENT, deadline: BigInt(Math.floor(Date.now()/1000) + 300) }],
  value: MON_IN,
});

console.log('Tx:', hash);
await client.waitForTransactionReceipt({ hash });
const bal = await client.readContract({
  address: ZEN,
  abi:[{name:'balanceOf',type:'function',stateMutability:'view',
    inputs:[{name:'account',type:'address'}],outputs:[{type:'uint256'}]}],
  functionName:'balanceOf', args:[RECIPIENT]
});
console.log('ZEN balance:', formatEther(bal));`;

export default function GetZen() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Get ZEN Tokens
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ZEN is the native token of the Zentra marketplace. Use the script below
            to swap testnet MON for ZEN via nad.fun's bonding curve.
          </p>
        </div>

        {/* Token Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border
                      border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Token Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Contract</span>
              <a
                href="https://testnet.monadvision.com/address/0x02300a68a6cA7E65FD0Fd95b17108F2AC7867777"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                0x02300a...7777 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Network</span>
              <span className="text-gray-900 dark:text-white">Monad Testnet (Chain ID: 10143)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Symbol</span>
              <span className="text-gray-900 dark:text-white">ZEN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Get testnet MON first</span>
              <a
                href="https://faucet.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                faucet.monad.xyz <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border
                      border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How to buy ZEN
          </h2>
          <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Get free testnet MON from <a href="https://faucet.monad.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">faucet.monad.xyz</a></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Install viem: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs">npm install viem</code></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Copy the script below, replace <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs">YOUR_PRIVATE_KEY</code> and <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs">YOUR_WALLET_ADDRESS</code></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>Run: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs">node buy-zen.mjs</code></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
              <span>Add Monad Testnet to MetaMask — RPC: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs">https://testnet-rpc.monad.xyz</code>, Chain ID: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs">10143</code></span>
            </li>
          </ol>
        </div>

        {/* Script */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border
                      border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4 border-b
                        border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              buy-zen.mjs
            </h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                       rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {copied
                ? <><CheckCircle className="w-4 h-4" /> Copied!</>
                : <><Copy className="w-4 h-4" /> Copy Script</>
              }
            </button>
          </div>
          <pre className="p-6 text-xs text-gray-800 dark:text-gray-200 overflow-x-auto
                        font-mono leading-relaxed whitespace-pre-wrap">
            {SCRIPT}
          </pre>
        </div>

        {/* Warning */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          ⚠️ Never share your private key publicly. Use a dedicated testnet wallet only.
        </p>

      </div>
    </div>
  );
}