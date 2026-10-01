const fs = require('fs');
const path = require('path');
const solc = require('solc');
const ROOT = path.join(__dirname, '..');

const baselineLogic = `
    function getTraits(uint256 tokenId) external view returns (uint64 packed, uint8 rarityTier, uint8 oneOfOneId) {
        ownerOf(tokenId);
        return (0, 0, 255);
    }
    function previewSVG(uint256 tokenId) external pure returns (string memory) {
        if (tokenId == 0 || tokenId > MAX_SUPPLY) revert InvalidTokenId();
        return "<svg></svg>";
    }
    function renderSVG(uint256 tokenId) external pure returns (string memory) {
        if (tokenId == 0 || tokenId > MAX_SUPPLY) revert InvalidTokenId();
        return "<svg></svg>";
    }
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        ownerOf(tokenId);
        return "data:application/json;utf8,{}";
    }
`;

const baselineFile = 'contracts/BroCodeBaseline.sol';
const base = fs.readFileSync(path.join(ROOT, 'contracts/BroCodeBase.sol'), 'utf8');
if (!base.includes('/*__RENDERER_LOGIC__*/')) throw new Error('Missing renderer marker in base template');
const baseline = base.replace('/*__RENDERER_LOGIC__*/', baselineLogic).replace('contract BroCodeBros2121 {', 'contract BroCodeBaseline {');
fs.writeFileSync(path.join(ROOT, baselineFile), baseline);

const sources = {};
for (const file of ['contracts/BroCodeBros2121.sol', 'contracts/BroCodeRenderer.sol', baselineFile]) {
  sources[file] = { content: fs.readFileSync(path.join(ROOT, file), 'utf8') };
}
const input = {
  language: 'Solidity',
  sources,
  settings: {
    optimizer: { enabled: true, runs: 1 },
    evmVersion: 'paris',
    metadata: { bytecodeHash: 'none', appendCBOR: false },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object', 'evm.methodIdentifiers'] } }
  }
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
for (const item of (output.errors || [])) {
  if (item.severity === 'error') console.error(item.formattedMessage);
  else console.warn(item.formattedMessage);
}
if ((output.errors || []).some(e => e.severity === 'error')) process.exit(1);
const pick = (file, name) => output.contracts[file][name];
const collection = pick('contracts/BroCodeBros2121.sol', 'BroCodeBros2121');
const renderer = pick('contracts/BroCodeRenderer.sol', 'BroCodeRenderer');
const baselineContract = pick(baselineFile, 'BroCodeBaseline');
const measurements = {
  collectionCreationBytes: collection.evm.bytecode.object.length / 2,
  collectionRuntimeBytes: collection.evm.deployedBytecode.object.length / 2,
  baselineCreationBytes: baselineContract.evm.bytecode.object.length / 2,
  baselineRuntimeBytes: baselineContract.evm.deployedBytecode.object.length / 2,
  embeddedArtworkAndMetadataDeltaBytes: collection.evm.deployedBytecode.object.length / 2 - baselineContract.evm.deployedBytecode.object.length / 2,
  rendererCreationBytes: renderer.evm.bytecode.object.length / 2,
  rendererRuntimeBytes: renderer.evm.deployedBytecode.object.length / 2
};
const artifact = {
  contractName: 'BroCodeBros2121',
  sourceName: 'contracts/BroCodeBros2121.sol',
  compiler: solc.version(),
  evmVersion: 'paris',
  optimizer: { enabled: true, runs: 1 },
  abi: collection.abi,
  bytecode: '0x' + collection.evm.bytecode.object,
  deployedBytecode: '0x' + collection.evm.deployedBytecode.object,
  methodIdentifiers: collection.evm.methodIdentifiers,
  measurements,
  rendererAbi: renderer.abi,
  rendererBytecode: '0x' + renderer.evm.bytecode.object,
  rendererRuntimeBytecode: '0x' + renderer.evm.deployedBytecode.object
};
fs.writeFileSync(path.join(ROOT, 'build/BroCodeBros2121.artifact.json'), JSON.stringify(artifact, null, 2));
console.log('Collection creation/runtime bytes:', measurements.collectionCreationBytes, measurements.collectionRuntimeBytes);
console.log('Baseline creation/runtime bytes:', measurements.baselineCreationBytes, measurements.baselineRuntimeBytes);
console.log('Embedded artwork+metadata runtime delta:', measurements.embeddedArtworkAndMetadataDeltaBytes, 'bytes');
console.log('Standalone renderer creation/runtime bytes:', measurements.rendererCreationBytes, measurements.rendererRuntimeBytes);
console.log('EIP-170 collection limit 24,576; over limit?', measurements.collectionRuntimeBytes > 24576);
if (measurements.collectionRuntimeBytes > 24576) throw new Error('Collection runtime exceeds EIP-170.');
if (measurements.rendererRuntimeBytes > 5000) throw new Error('Standalone renderer runtime exceeds the 5,000-byte measurement target.');
