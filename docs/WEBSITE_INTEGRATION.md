# Website integration handoff (no site changes made)

Target site: `https://brocode.surge.sh/`  
The assistant has not edited, deployed, or rebuilt the live site. This document and `release/BroCodeBros2121.abi.json` are a handoff for its maintainer after the NFT contract has been deployed and its address confirmed. For visual approval, `release/BROCODE-art-only-preview.html` is an offline review gallery; it is not a replacement site or a hosted mint page.

## Network and ABI

- Cronos mainnet chain ID: `25`.
- Read the contract at the deployed address with `release/BroCodeBros2121.abi.json`.
- The `previewSVG(uint256)` and `renderSVG(uint256)` functions are read-only and work before mint/sale. They return SVG art only.
- `tokenURI(uint256)` works only after mint and returns an on-chain `data:application/json;utf8,...` URI whose `image` is an on-chain SVG data URI.
- `contractURI()` returns collection-level JSON and its vector logo as data URIs.

## Art-only pre-mint gallery

The gallery can be read without connecting a wallet. Use a Cronos RPC provider and call `previewSVG(1..2121)`. Render each result as an image; do not print the ID, name, attributes, rarity, or `getTraits()` results in the gallery UI. Shuffle presentation order if desired. Cache read results in browser memory for the current session to avoid repeat calls.

```js
// ethers v6 sketch; insert the deployed address and ABI after deployment.
import { ethers } from 'ethers';
import abi from './BroCodeBros2121.abi.json';

const readProvider = new ethers.JsonRpcProvider(CRONOS_READ_RPC);
const nft = new ethers.Contract(DEPLOYED_BROS_ADDRESS, abi, readProvider);

async function renderArtOnlyGallery(container) {
  const max = Number(await nft.MAX_SUPPLY());
  const ids = Array.from({ length: max }, (_, i) => i + 1);
  // Presentation-only shuffle. It is not a hidden or cryptographic assignment.
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  for (let start = 0; start < ids.length; start += 12) {
    const batch = await Promise.all(ids.slice(start, start + 12).map(async (id) => {
      const svg = await nft.previewSVG(id);
      const img = document.createElement('img');
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      img.alt = 'BRO CODE avatar preview'; // no visible ID or rarity label
      img.loading = 'lazy';
      return img;
    }));
    for (const img of batch) container.appendChild(img);
  }
}
```

A full gallery means 2,121 `eth_call`s. The site maintainer should check RPC throughput/limits and select a batch size; use a Cronos RPC endpoint permitted by the site's existing policy. The HTML may hide labels, but **on-chain mappings are public**: anyone can inspect bytecode, the public deterministic seed, input IDs, and renderer to recover trait/rarity assignments. This UI is not a reveal or secrecy mechanism.

## Paid mint flow

A read-only preview/gallery needs no wallet. A paid mint requires a wallet and a signed transaction. Check `saleStarted()` first and disable the mint button while false. The user can mint 1–10 at once, limited by their address's lifetime `mintedBy(address)` count and the remaining supply. Price is fixed in code at 69 CRO per token.

```js
const provider = new ethers.BrowserProvider(window.ethereum);
const network = await provider.getNetwork();
if (network.chainId !== 25n) throw new Error('Switch wallet to Cronos mainnet');
const signer = await provider.getSigner();
const buyer = await signer.getAddress();
const writable = new ethers.Contract(DEPLOYED_BROS_ADDRESS, abi, signer);

if (!(await writable.saleStarted())) throw new Error('Public mint is not open yet');
const maxPerAddress = await writable.MAX_PER_WALLET();
const minted = await writable.mintedBy(buyer);
const remainingForAddress = Number(maxPerAddress - minted);
const remainingSupply = Number((await writable.MAX_SUPPLY()) - (await writable.totalSupply()));
const quantity = Math.min(requestedQuantity, remainingForAddress, remainingSupply, 10);
if (quantity < 1) throw new Error('No mint allowance or supply remains');
const price = await writable.MINT_PRICE();
const tx = await writable.mint(quantity, { value: price * BigInt(quantity) });
const receipt = await tx.wait();
```

Do not calculate token IDs from an earlier `totalSupply()` read as though they are reserved: other wallets can mint first. Use the confirmed receipt's `Transfer` events to discover the IDs actually minted. The gallery itself should remain art-only if that remains the desired presentation.

## Manual X Space opening

At the announced Space, the treasury/sale-opener address makes one transaction:

```js
await writableFromTreasury.startSale();
```

The contract has no scheduled timestamp, no pause/resume, no price setter, and no second opener. `startSale()` is a one-way switch. The NFT transaction can be made from the website; the contract does not provide any X Space audio, join, or leave control.

## Method guide

| Method | Website purpose |
|---|---|
| `saleStarted()` | Closed/open state for mint UI |
| `totalSupply()` / `MAX_SUPPLY()` | Mint progress |
| `MINT_PRICE()` | Fixed native-CRO price (69 CRO) |
| `MAX_PER_WALLET()` / `mintedBy(address)` | Address allowance |
| `previewSVG(id)` | Unminted art preview; no labels returned |
| `mint(quantity)` payable | Public mint at exact payment |
| `tokenURI(id)` | Metadata after mint |
| `contractURI()` | Collection metadata / vector logo |
| `royaltyInfo(id, salePrice)` | ERC-2981 receiver and 5% amount |
| `getTraits(id)` | Minted-token-only packed tier/1-of-1 data; do not use for the pre-mint gallery |
| `startSale()` | One-time manual activation; treasury only |

This is an ABI/interface handoff only. The site maintainer must add the deployed address, connect its existing wallet/provider flow, and review the final UI themselves.
