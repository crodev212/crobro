const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const MAINNET_TREASURY = '0xef5c5b9129aafefdff459349e7628c60016e810e';
const artifactPath = path.join(__dirname, '../build/BroCodeBros2121.artifact.json');

(async () => {
  const rpcUrl = process.env.CRONOS_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!rpcUrl || !privateKey) throw new Error('Set CRONOS_RPC_URL and DEPLOYER_PRIVATE_KEY in your local environment.');
  if (!fs.existsSync(artifactPath)) throw new Error('Artifact missing. Run npm run compile first.');

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const network = await provider.getNetwork();
  const targetChainId = BigInt(process.env.CRONOS_CHAIN_ID || '25');
  if (network.chainId !== targetChainId) {
    throw new Error(`RPC chain ID ${network.chainId} does not match CRONOS_CHAIN_ID ${targetChainId}.`);
  }

  const treasury = process.env.BRO_TREASURY_ADDRESS || MAINNET_TREASURY;
  if (!ethers.isAddress(treasury) || treasury === ethers.ZeroAddress) throw new Error('BRO_TREASURY_ADDRESS is invalid.');
  const confirm = `DEPLOY-${targetChainId}`;
  if (process.env.BROCODE_DEPLOY_CONFIRM !== confirm) {
    console.log('DRY RUN ONLY — no transaction sent.');
    console.log(`Network: ${network.name} (chain ID ${network.chainId})`);
    console.log(`Deployer: ${signer.address}`);
    console.log(`Immutable treasury, ERC-2981 receiver, and sale opener: ${ethers.getAddress(treasury)}`);
    console.log(`To actually deploy, set BROCODE_DEPLOY_CONFIRM=${confirm} after reviewing the pre-deployment checklist.`);
    process.exit(0);
  }

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const request = await factory.getDeployTransaction(treasury);
  const estimated = await provider.estimateGas({ from: signer.address, data: request.data });
  const fee = await provider.getFeeData();
  const options = { gasLimit: estimated * 120n / 100n };
  if (fee.gasPrice) options.gasPrice = fee.gasPrice;
  console.log(`Deploying to chain ${network.chainId} from ${signer.address}`);
  console.log(`Treasury/opener/royalty recipient: ${ethers.getAddress(treasury)}`);
  console.log(`Estimated deployment gas: ${estimated}; configured limit: ${options.gasLimit}`);

  const deployed = await factory.deploy(treasury, options);
  console.log('Deployment transaction:', deployed.deploymentTransaction().hash);
  await deployed.waitForDeployment();
  const address = await deployed.getAddress();
  const receipt = await deployed.deploymentTransaction().wait();
  const code = await provider.getCode(address);
  if (code === '0x') throw new Error('Deployment receipt returned no contract code.');

  console.log('Contract address:', address);
  console.log('Confirmed deployment gas used:', receipt.gasUsed.toString());
  console.log('Runtime bytecode bytes:', (code.length - 2) / 2);
  console.log('Sale remains CLOSED. The treasury must call startSale() manually at the announced X Space.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
