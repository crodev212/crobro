const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { ethers } = require('ethers');
const { createVM } = require('@ethereumjs/vm');
const { createAddressFromString, hexToBytes, Account } = require('@ethereumjs/util');

(async () => {
  const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/BroCodeBros2121.artifact.json'), 'utf8'));
  const vm = await createVM();
  const treasury = createAddressFromString('0xef5c5b9129aafefdff459349e7628c60016e810e');
  const alice = createAddressFromString('0x1111111111111111111111111111111111111111');
  const bob = createAddressFromString('0x2222222222222222222222222222222222222222');
  const rich = new Account(0n, ethers.parseEther('100000'));
  await vm.stateManager.putAccount(treasury, new Account(0n, ethers.parseEther('1000')));
  await vm.stateManager.putAccount(alice, rich);
  await vm.stateManager.putAccount(bob, rich);

  const iface = new ethers.Interface(artifact.abi);
  const deployData = hexToBytes(artifact.bytecode + iface.encodeDeploy([treasury.toString()]).slice(2));
  const deployed = await vm.evm.runCall({ caller: treasury, data: deployData, gasLimit: 30_000_000n });
  assert(!deployed.execResult.exceptionError, String(deployed.execResult.exceptionError || 'deploy failed'));
  const contractAddress = deployed.createdAddress;

  async function call(caller, method, args = [], value = 0n, gasLimit = 15_000_000n) {
    const data = hexToBytes(iface.encodeFunctionData(method, args));
    const r = await vm.evm.runCall({ caller, to: contractAddress, value, data, gasLimit });
    return { reverted: Boolean(r.execResult.exceptionError), gasUsed: r.execResult.executionGasUsed,
      decoded: r.execResult.exceptionError ? null : iface.decodeFunctionResult(method, r.execResult.returnValue),
      returnValue: r.execResult.returnValue, raw: r };
  }

  const name = (await call(treasury, 'name')).decoded[0];
  const symbol = (await call(treasury, 'symbol')).decoded[0];
  const price = (await call(treasury, 'MINT_PRICE')).decoded[0];
  const maxSupply = (await call(treasury, 'MAX_SUPPLY')).decoded[0];
  assert.strictEqual(name, '$BROS');
  assert.strictEqual(symbol, 'BROS');
  assert.strictEqual(price, ethers.parseEther('69'));
  assert.strictEqual(maxSupply, 2121n);
  assert.strictEqual((await call(alice, 'startSale')).reverted, true);
  assert.strictEqual((await call(treasury, 'saleStarted')).decoded[0], false);

  const preview = (await call(alice, 'previewSVG', [1])).decoded[0];
  assert(preview.startsWith("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'"));
  assert(preview.endsWith('</svg>'));
  assert.strictEqual((await call(alice, 'tokenURI', [1])).reverted, true);

  assert.strictEqual((await call(treasury, 'startSale')).reverted, false);
  assert.strictEqual((await call(treasury, 'startSale')).reverted, true);
  assert.strictEqual((await call(alice, 'mint', [1], 0n)).reverted, true);
  const mint = await call(alice, 'mint', [1], ethers.parseEther('69'));
  assert.strictEqual(mint.reverted, false);
  assert.strictEqual((await call(treasury, 'totalSupply')).decoded[0], 1n);
  assert.strictEqual((await call(treasury, 'ownerOf', [1])).decoded[0].toLowerCase(), alice.toString().toLowerCase());

  const uri = (await call(treasury, 'tokenURI', [1])).decoded[0];
  const prefix = 'data:application/json;utf8,';
  assert(uri.startsWith(prefix));
  const meta = JSON.parse(uri.slice(prefix.length));
  assert.strictEqual(meta.name, '$BROS #1');
  assert(meta.description.includes('BRO CODE'));
  assert.strictEqual(meta.external_url, 'https://brocode.surge.sh/');
  assert.strictEqual(meta.attributes.length, 16);
  assert(meta.image.startsWith('data:image/svg+xml;utf8,<svg'));
  const royalty = (await call(treasury, 'royaltyInfo', [1, ethers.parseEther('100')])).decoded;
  assert.strictEqual(royalty[0].toLowerCase(), treasury.toString().toLowerCase());
  assert.strictEqual(royalty[1], ethers.parseEther('5'));

  const collectionDataUri = (await call(treasury, 'contractURI')).decoded[0];
  const collection = JSON.parse(collectionDataUri.slice(prefix.length));
  assert.strictEqual(collection.name, '$BROS');
  assert.strictEqual(collection.symbol, 'BROS');
  assert.strictEqual(collection.seller_fee_basis_points, 500);
  assert(collection.image.includes('<svg'));

  const beforeBob = (await call(treasury, 'totalSupply')).decoded[0];
  assert.strictEqual((await call(bob, 'mint', [10], ethers.parseEther('690'))).reverted, false);
  assert.strictEqual((await call(bob, 'mint', [1], ethers.parseEther('69'))).reverted, true);
  assert.strictEqual((await call(treasury, 'totalSupply')).decoded[0], beforeBob + 10n);
  console.log('Smoke passed. contract=', contractAddress.toString());
  console.log('previewSVG(1)=', preview);
  console.log('tokenURI(1) metadata=', JSON.stringify(meta));
  console.log('Collection metadata=', JSON.stringify(collection));
  console.log('Mint gasUsed(1)=', mint.gasUsed.toString());
})().catch(err => { console.error(err); process.exit(1); });
