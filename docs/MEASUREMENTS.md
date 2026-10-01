# Reproducible size and gas measurements

Build command: `npm test`  
Compiler: Solidity `0.8.37+commit.f401782d`, optimizer enabled, 1 run, Paris EVM, metadata hash disabled.  
All sizes below are bytes; all gas used below was measured in a local in-memory EthereumJS VM, not on a Cronos transaction.

## Byte counts — do not conflate these categories

| Measurement | Bytes | What it is |
|---|---:|---|
| Serialized renderer ROM | 2,651 | Compact on-chain data table (SVG shape dictionary, trait names, categories/tiers, templates, 21 1/1 configs, palettes and layer offsets). Not a rendered SVG and not the deployed runtime. |
| Standalone renderer creation bytecode | 5,030 | Measurement-only renderer init code. The renderer is **not** deployed separately. |
| Standalone renderer runtime bytecode | 4,999 | Measurement-only deployed renderer runtime; under a 5,000-byte runtime target by 1 byte. |
| Collection creation bytecode | 12,077 | Actual deployable contract init bytecode; constructor argument adds another ABI word to the deployment transaction data. |
| Collection deployed runtime | 11,844 | Actual ERC-721 contract runtime with renderer and metadata embedded. |
| Baseline creation/runtime | 7,494 / 7,261 | Same collection base, compiler, and settings, but renderer/metadata entrypoints replaced by trivial stubs. Measurement only; not deployable. |
| Embedded renderer + artwork + metadata delta | 4,583 | Collection runtime minus the matching baseline runtime. This is an incremental comparison, not an SVG-size claim. |

The collection runtime is 12,732 bytes below EIP-170's 24,576-byte deployed-code limit. The 4,999-byte renderer is a **separate measurement artifact**, not the complete collection size. The actual NFT contract is 11,844 runtime bytes and 12,077 creation bytes.

## ROM breakdown

| ROM component | Bytes |
|---|---:|
| SVG primitive dictionary / shape bytes | 930 |
| Trait names | 609 |
| Tier and category names | 159 |
| SVG/JSON templates | 673 |
| 21 one-of-one configuration records | 168 |
| Palette, skin-palette, and layer-base data | 112 |
| **Total** | **2,651** |

The runtime also includes EVM code to decode those records, compute deterministic traits, draw SVG, and serialize JSON. ROM size alone is not runtime size.

## Deterministic trait tiers

The complete collection was scanned in the VM using the same `getTraits()` logic. It yields exactly 2,121 slots and 21 unique 1/1 configuration IDs:

| Tier | Count |
|---|---:|
| Common | 900 |
| Uncommon | 650 |
| Rare | 350 |
| Epic | 150 |
| Legendary | 50 |
| 1/1 | 21 |
| **Total** | **2,121** |

The seed and resulting mapping are public/deterministic. This table is not a promise that rarity will remain hidden before mint.

## Gas

VM execution gas (transaction intrinsic/calldata cost excluded):

| Operation | VM execution gas |
|---|---:|
| Deploy | 2,393,813 |
| `startSale()` | 22,328 |
| `mint(1)` | 110,012 |
| `mint(10)` | 289,857 |

For a rough transaction estimate, common creation intrinsic/data costs were added to deployment, and 21,000 base transaction gas plus ABI calldata cost were added to calls. This gives approximately:

| Operation | Approx transaction gas | CRO at 640.42 Gwei |
|---|---:|---:|
| Deploy | 2,635,639 | 1.6879 CRO |
| `startSale()` | 43,392 | 0.0278 CRO |
| `mint(1)` | 131,216 | 0.0840 CRO |
| `mint(10)` | 311,061 | 0.1992 CRO |

The gas-price input is the Cronos Explorer's displayed average-gas snapshot observed while preparing this handoff ([Cronos Explorer](https://explorer.cronos.com/)); it changes over time and is not a quote. Wallet/provider `estimateGas`, current Cronos fee conditions, and the actual receipt are authoritative. Deployment estimates also depend on the network's init-code intrinsic rules.

## Test coverage

`test/test_brocode.js` compiles/deploys locally and checks:

- metadata JSON and SVG data URIs parse; art has no external image/script references;
- on-chain art preview works before mint and rejects IDs outside 1–2,121;
- sale is closed until the treasury's one-way `startSale()` call;
- exact 69 CRO pricing, public mint without a holder gate, and the lifetime 10-per-address limit;
- ERC-721 ownership, approval, operator approval, transfer and safe transfer to EOAs;
- ERC-165, ERC-721 metadata, and ERC-2981 interface IDs;
- 5% `royaltyInfo` receiver/amount and dynamic collection-metadata fee recipient;
- complete 2,121-token sellout and exactly 21 unique 1/1 assignments.

This is a local functional test, not an independent security audit, Cronos fork test, wallet UI test, or marketplace certification.
