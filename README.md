# BRO CODE `$BROS` — Cronos ERC-721

A single-deployment, fully on-chain avatar collection adapted for the CRO BRO CODE identity. The deployable contract includes its SVG renderer, deterministic trait table, token metadata generator, sale logic, ERC-721, and ERC-2981 royalty reporting. **No image files, IPFS, HTTP metadata service, renderer deployment, or website modification are required by the contract.**

## Fixed collection terms

| Setting | Value |
|---|---:|
| Collection name | `$BROS` |
| Symbol | `BROS` |
| Chain | Cronos EVM; mainnet chain ID 25 |
| Supply | 2,121; token IDs 1–2,121 |
| Public mint | All 2,121 are available; no `$BRO` holder gate or reserved holder allocation |
| Price | 69 native CRO per NFT (exact payment) |
| Limit | 10 lifetime mints per EVM address; it is not a person-level anti-sybil limit |
| Sale opening | One irreversible manual `startSale()` call; no timestamp or later configuration setter |
| Royalties | ERC-2981, 500 bps (5%); marketplace enforcement depends on the marketplace |
| Payout / royalty receiver | `0xef5c5b9129aafefdff459349e7628c60016e810e` by default |
| Website URL in metadata | `https://brocode.surge.sh/` |

The constructor currently uses the same supplied treasury address for immutable mint proceeds, royalty receiver, and the only address allowed to start the sale. This is an explicit deployment assumption that must be confirmed before a mainnet transaction. The receiver's private-key control has not been verified.

## Art direction and review

The on-chain sprites are a compact geometric vector interpretation of the site's mascot cues—electric-blue cap, dark coin-lens shades, orange skin, foreground fist, gold chain/medallion, dark shirt, and Cronos blue backgrounds. They are not a raster trace or a 1:1 recreation of the large website PFP; review the full art-only gallery before approving an immutable deployment. `npm run preview` regenerates it from `previewSVG()`.

## Pre-deployment approvals still required

This package is compiled and testable, but do not broadcast the mainnet deployment until the collection owner confirms:

1. **Treasury/opener:** Should `0xef5c5b9129aafefdff459349e7628c60016e810e` be both the permanent proceeds/royalty receiver and the sole sale opener? It is immutable after deployment. If not, change the constructor design before deploying.
2. **Seed and reveal expectations:** the current deterministic seed is `keccak256("BRO_CODE_2121_GENESIS_SEED")`. It is intentionally public, not secret. The art and token-ID/trait/rarity mapping can be derived from public contract code and the seed. The website gallery can omit labels, but cannot make the on-chain mapping secret. If rarity must be unpredictable until after mint, this design needs a different, reviewed reveal/randomness mechanism before deployment.
3. **Art approval:** inspect the preview samples and collection logo before deploying; immutable on-chain art cannot be replaced afterward.

The public preview endpoint is art-only and returns no ID or rarity label, and `getTraits()` is available only for minted tokens. This reduces accidental disclosure in the site UI; it is **not** cryptographic secrecy.

## Build and test

Requires Node.js and npm. From this directory:

```sh
npm install
npm test
```

`npm test` regenerates the Solidity from `scripts/brocode_traits.js`, compiles with Solidity `0.8.37`, optimizer enabled (1 run), Paris EVM, and metadata hash disabled, then runs an in-memory EVM test suite. No RPC is contacted by the tests.

Generate the local, art-only approval gallery (2,121 images; no visible IDs/traits/rarity) with `npm run preview`. This creates `release/BROCODE-art-only-preview.html`; it is a local review artifact, not a new or deployed website.

To only compile:

```sh
npm run compile
```

Generated outputs:

- `contracts/BroCodeBros2121.sol` — the one contract intended for deployment.
- `contracts/BroCodeRenderer.sol` — standalone renderer used for code-size measurement only; do **not** deploy it.
- `contracts/BroCodeBaseline.sol` — measurement-only ERC-721 baseline with renderer stubs; do **not** deploy it.
- `build/BroCodeBros2121.artifact.json` — ABI, creation/runtime bytecode, method identifiers, and measurements.
- `build/trait_definitions.json` — human-readable art/trait data used by the generator.

## Deploy

Review `docs/DEPLOYMENT.md` first. The helper defaults to dry-run and refuses a broadcast unless `BROCODE_DEPLOY_CONFIRM=DEPLOY-25` is set on Cronos mainnet. It never calls `startSale()`.

```sh
CRONOS_RPC_URL='https://YOUR-CRONOS-RPC' \
DEPLOYER_PRIVATE_KEY='LOCAL-SECRET-NEVER-COMMIT' \
npm run deploy
```

After reviewing the printed chain and immutable addresses, a deliberate mainnet deployment requires:

```sh
BROCODE_DEPLOY_CONFIRM=DEPLOY-25 npm run deploy
```

Keep the deployment key out of this project, logs, browser code, and source control. The deployment script is provided for the user's operator; no deployment has been made by this package.

## Website integration

No files at `brocode.surge.sh` were edited. See `docs/WEBSITE_INTEGRATION.md` for the ABI, preview-only gallery flow, wallet mint call, and sale status checks. `release/BroCodeBros2121.abi.json` is the standalone ABI file for the site maintainer.

## Gas and code-size summary

See `docs/MEASUREMENTS.md` for runtime/ROM distinctions, a reproducible size baseline, EVM test gas, and clearly qualified CRO estimates. The 4,999-byte figure is the **standalone renderer runtime**, not the complete NFT contract. The actual collection runtime is 11,844 bytes, under EIP-170's 24,576-byte limit.
# crobro
