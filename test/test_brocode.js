const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { ethers } = require('ethers');
const { createVM } = require('@ethereumjs/vm');
const { createAddressFromString, hexToBytes, Account } = require('@ethereumjs/util');

const PREFIX = 'data:application/json;utf8,';
const CRO = ethers.parseEther('1');

(async () => {
  const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/BroCodeBros2121.artifact.json'), 'utf8'));
  const vm = await createVM();
  const treasury = createAddressFromString('0xef5c5b9129aafefdff459349e7628c60016e810e');
  const alice = createAddressFromString('0x1111111111111111111111111111111111111111');
  const bob = createAddressFromString('0x2222222222222222222222222222222222222222');
  const carol = createAddressFromString('0x3333333333333333333333333333333333333333');
  const rich = new Account(0n, ethers.parseEther('1000000'));
  for (const addr of [treasury, alice, bob, carol]) await vm.stateManager.putAccount(addr, rich);

  const iface = new ethers.Interface(artifact.abi);
  const deploymentData = hexToBytes(artifact.bytecode + iface.encodeDeploy([treasury.toString()]).slice(2));
  const deployed = await vm.evm.runCall({ caller: treasury, data: deploymentData, gasLimit: 30_000_000n });
  assert(!deployed.execResult.exceptionError, `deployment failed: ${deployed.execResult.exceptionError}`);
  const contract = deployed.createdAddress;
  const gas = { deployment: deployed.execResult.executionGasUsed };

  async function call(caller, method, args = [], value = 0n, gasLimit = 30_000_000n) {
    const data = hexToBytes(iface.encodeFunctionData(method, args));
    const result = await vm.evm.runCall({ caller, to: contract, value, data, gasLimit });
    const reverted = Boolean(result.execResult.exceptionError);
    const fragment = iface.getFunction(method);
    const decoded = !reverted && fragment.outputs.length
      ? iface.decodeFunctionResult(method, result.execResult.returnValue)
      : null;
    return { reverted, error: result.execResult.exceptionError, decoded,
      gasUsed: result.execResult.executionGasUsed, raw: result };
  }
  const ok = async (...args) => {
    const r = await call(...args);
    assert(!r.reverted, `expected success, got ${r.error}`);
    return r;
  };
  const no = async (...args) => {
    const r = await call(...args);
    assert(r.reverted, 'expected a revert');
    return r;
  };

  // Fixed public mint terms and manual, one-way sale activation.
  assert.strictEqual((await ok(treasury, 'name')).decoded[0], '$BROS');
  assert.strictEqual((await ok(treasury, 'symbol')).decoded[0], 'BROS');
  assert.strictEqual((await ok(treasury, 'MAX_SUPPLY')).decoded[0], 2121n);
  assert.strictEqual((await ok(treasury, 'MAX_PER_WALLET')).decoded[0], 10n);
  assert.strictEqual((await ok(treasury, 'MINT_PRICE')).decoded[0], ethers.parseEther('69'));
  assert.strictEqual((await ok(treasury, 'ROYALTY_BPS')).decoded[0], 500n);
  assert.strictEqual((await ok(treasury, 'saleStarted')).decoded[0], false);
  await no(alice, 'startSale');
  await no(alice, 'mint', [1], 69n * CRO);
  await no(treasury, 'mint', [1], 69n * CRO);

  // Every unminted art preview is on-chain; it contains art only (no IDs or rarity labels).
  const preview = (await ok(alice, 'previewSVG', [1])).decoded[0];
  assert(preview.startsWith("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'"));
  assert(preview.endsWith('</svg>'));
  assert(preview.includes("fill='#f80'"), 'Skin palette must be keyed to the Skin layer trait');
  assert(!/<script|<image|href=|https?:\/\/(?!www\.w3\.org)/i.test(preview));
  assert.strictEqual((await ok(alice, 'renderSVG', [1])).decoded[0], preview);
  await no(alice, 'previewSVG', [0]);
  await no(alice, 'previewSVG', [2122]);
  await no(alice, 'tokenURI', [1]);
  await no(alice, 'getApproved', [1]);

  const sale = await ok(treasury, 'startSale');
  gas.saleStart = sale.gasUsed;
  assert.strictEqual((await ok(treasury, 'saleStarted')).decoded[0], true);
  await no(treasury, 'startSale');

  // Price must be exact; public callers need no $BRO balance/holder allowlist.
  await no(alice, 'mint', [1], 68n * CRO);
  await no(alice, 'mint', [1], 70n * CRO);
  const treasuryBefore = (await vm.stateManager.getAccount(treasury)).balance;
  const mintOne = await ok(alice, 'mint', [1], 69n * CRO);
  gas.mintOne = mintOne.gasUsed;
  const treasuryAfter = (await vm.stateManager.getAccount(treasury)).balance;
  assert.strictEqual(treasuryAfter - treasuryBefore, 69n * CRO);
  assert.strictEqual((await ok(treasury, 'ownerOf', [1])).decoded[0].toLowerCase(), alice.toString().toLowerCase());
  assert.strictEqual((await ok(treasury, 'balanceOf', [alice.toString()])).decoded[0], 1n);
  assert.strictEqual((await ok(treasury, 'mintedBy', [alice.toString()])).decoded[0], 1n);

  const uri = (await ok(alice, 'tokenURI', [1])).decoded[0];
  assert(uri.startsWith(PREFIX));
  const metadata = JSON.parse(uri.slice(PREFIX.length));
  assert.strictEqual(metadata.name, '$BROS #1');
  assert(metadata.description.includes('69 CRO'));
  assert(metadata.description.includes('no holder allocation'));
  assert.strictEqual(metadata.external_url, 'https://brocode.surge.sh/');
  assert.strictEqual(metadata.attributes.length, 16);
  assert.strictEqual(metadata.attributes.find(x => x.trait_type === 'Headwear').value, 'Blue Cap');
  assert.strictEqual(metadata.attributes.find(x => x.trait_type === 'Eyewear').value, 'Coin Shades');
  assert.strictEqual(metadata.attributes.find(x => x.trait_type === 'Accessory').value, 'Gold Chain');
  assert(metadata.image.startsWith('data:image/svg+xml;utf8,<svg'));
  assert(metadata.image.includes('%23'));

  const collectionURI = (await ok(treasury, 'contractURI')).decoded[0];
  assert(collectionURI.startsWith(PREFIX));
  const collectionMetadata = JSON.parse(collectionURI.slice(PREFIX.length));
  assert.strictEqual(collectionMetadata.name, '$BROS');
  assert.strictEqual(collectionMetadata.symbol, 'BROS');
  assert.strictEqual(collectionMetadata.related_token_contract, '0xbda25adb44124b9cbb1b747ceb788ef594750e6f');
  assert.strictEqual(collectionMetadata.seller_fee_basis_points, 500);
  assert.strictEqual(collectionMetadata.fee_recipient.toLowerCase(), treasury.toString().toLowerCase());
  assert(collectionMetadata.description.includes('2,121 are public'));
  assert(collectionMetadata.image.includes('<svg'));
  assert.strictEqual((await ok(alice, 'supportsInterface', ['0x01ffc9a7'])).decoded[0], true);
  assert.strictEqual((await ok(alice, 'supportsInterface', ['0x80ac58cd'])).decoded[0], true);
  assert.strictEqual((await ok(alice, 'supportsInterface', ['0x5b5e139f'])).decoded[0], true);
  assert.strictEqual((await ok(alice, 'supportsInterface', ['0x2a55205a'])).decoded[0], true);
  await ok(alice, 'mint', [9], 621n * CRO);
  assert.strictEqual((await ok(alice, 'mintedBy', [alice.toString()])).decoded[0], 10n);

  // ERC-2981 is a 5% advisory royalty; ERC-721 approvals/transfers work.
  const [receiver, royalty] = (await ok(alice, 'royaltyInfo', [1, 100n * CRO])).decoded;
  assert.strictEqual(receiver.toLowerCase(), treasury.toString().toLowerCase());
  assert.strictEqual(royalty, 5n * CRO);
  await ok(alice, 'approve', [bob.toString(), 1]);
  assert.strictEqual((await ok(bob, 'getApproved', [1])).decoded[0].toLowerCase(), bob.toString().toLowerCase());
  await ok(bob, 'transferFrom', [alice.toString(), bob.toString(), 1]);
  assert.strictEqual((await ok(treasury, 'ownerOf', [1])).decoded[0].toLowerCase(), bob.toString().toLowerCase());
  assert.strictEqual((await ok(treasury, 'getApproved', [1])).decoded[0], ethers.ZeroAddress);
  assert.strictEqual((await ok(treasury, 'balanceOf', [alice.toString()])).decoded[0], 9n);
  assert.strictEqual((await ok(treasury, 'balanceOf', [bob.toString()])).decoded[0], 1n);
  await ok(alice, 'setApprovalForAll', [carol.toString(), true]);
  await ok(carol, 'transferFrom', [alice.toString(), carol.toString(), 2]);
  assert.strictEqual((await ok(treasury, 'ownerOf', [2])).decoded[0].toLowerCase(), carol.toString().toLowerCase());
  await ok(carol, 'safeTransferFrom(address,address,uint256)', [carol.toString(), alice.toString(), 2]);
  assert.strictEqual((await ok(treasury, 'ownerOf', [2])).decoded[0].toLowerCase(), alice.toString().toLowerCase());
  assert.strictEqual((await ok(treasury, 'balanceOf', [alice.toString()])).decoded[0], 9n);

  // Address cap applies cumulatively; a second wallet remains independently eligible.
  await no(alice, 'mint', [1], 69n * CRO);
  const mintTen = await ok(bob, 'mint', [10], 690n * CRO);
  gas.mintTen = mintTen.gasUsed;
  assert.strictEqual((await ok(bob, 'mintedBy', [bob.toString()])).decoded[0], 10n);
  assert.strictEqual((await ok(carol, 'mint', [1], 69n * CRO)).reverted, false);

  // Fill all 2,121 slots; verify there are exactly 21 pre-configured 1/1 IDs.
  // Wallets are distinct by address; this intentionally models address-level, not human-level, limits.
  let total = (await ok(treasury, 'totalSupply')).decoded[0];
  let walletIndex = 1000;
  while (total + 10n <= 2120n) {
    const addressText = '0x' + BigInt(walletIndex++).toString(16).padStart(40, '0');
    const account = createAddressFromString(addressText);
    await vm.stateManager.putAccount(account, rich);
    await ok(account, 'mint', [10], 690n * CRO);
    total += 10n;
  }
  while (total < 2121n) {
    const addressText = '0x' + BigInt(walletIndex++).toString(16).padStart(40, '0');
    const account = createAddressFromString(addressText);
    await vm.stateManager.putAccount(account, rich);
    const q = Number(2121n - total);
    await ok(account, 'mint', [q], BigInt(q) * 69n * CRO);
    total += BigInt(q);
  }
  assert.strictEqual((await ok(treasury, 'totalSupply')).decoded[0], 2121n);
  await no(carol, 'mint', [1], 69n * CRO);
  await no(treasury, 'tokenURI', [2122]);

  let oneOfOnes = 0;
  let highestTier = 0;
  let sampleOneOfOneToken = 0;
  const tierCounts = {};
  const oneOfOneIds = new Set();
  for (let tokenId = 1; tokenId <= 2121; tokenId++) {
    const [packed, tier, oneOfOneId] = (await ok(treasury, 'getTraits', [tokenId])).decoded;
    assert(packed >= 0n);
    const tierNumber = Number(tier);
    tierCounts[tierNumber] = (tierCounts[tierNumber] || 0) + 1;
    if (tierNumber > highestTier) highestTier = tierNumber;
    if (Number(oneOfOneId) < 21) {
      oneOfOnes++;
      oneOfOneIds.add(Number(oneOfOneId));
      sampleOneOfOneToken ||= tokenId;
    }
  }
  assert.strictEqual(oneOfOnes, 21, `expected 21 1/1s, found ${oneOfOnes}`);
  assert.strictEqual(oneOfOneIds.size, 21, 'each 1/1 config must be used exactly once');
  const rareURI = (await ok(treasury, 'tokenURI', [sampleOneOfOneToken])).decoded[0];
  const rareMeta = JSON.parse(rareURI.slice(PREFIX.length));
  assert.strictEqual(rareMeta.attributes.length, 17);
  assert(rareMeta.attributes.some(x => x.trait_type === '1/1'));

  // Collect deployment/mint measurements. EVM call gas excludes transaction intrinsic gas.
  const m = artifact.measurements;
  console.log('PASS: mint, metadata, art preview, ERC-721, ERC-2981, cap and 2,121 supply tests');
  console.log(`Contract ${contract.toString()} (local VM only)`);
  console.log(`Runtime ${m.collectionRuntimeBytes} bytes; baseline ${m.baselineRuntimeBytes}; embedded art+metadata delta ${m.embeddedArtworkAndMetadataDeltaBytes}`);
  console.log(`Standalone renderer runtime ${m.rendererRuntimeBytes} bytes; 1/1 count ${oneOfOnes}; rarity tier counts ${JSON.stringify(tierCounts)}; highest tier ${highestTier}`);
  console.log(`EVM execution gas: deploy ${gas.deployment}; startSale ${gas.saleStart}; mint(1) ${gas.mintOne}; mint(10) ${gas.mintTen}`);
})().catch(err => { console.error(err); process.exit(1); });
