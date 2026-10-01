# Deployment and preflight

**Nothing in this package has been deployed.** Contract address, transaction hash, and actual Cronos receipts will only exist after an authorized operator broadcasts a transaction.

## Immutable constructor choices

Before mainnet deployment, explicitly approve all of the following:

1. **Treasury / royalty recipient / sale opener:** the constructor receives the treasury address. `treasury` and `saleOpener` are both immutable and set to that address. The default is `0xef5c5b9129aafefdff459349e7628c60016e810e`, supplied for this BRO CODE work; private-key control has not been verified. If the team wants a separate opener, make that change and rerun the full build/test before deploying.
2. **Seed / distribution:** `collectionSeed` is currently `keccak256("BRO_CODE_2121_GENESIS_SEED")`, compiled into the collection. It is deterministic and public. Changing it changes art/rarity assignments, so rebuild and inspect the gallery before a deployment. The present version does not promise hidden or post-mint rarity.
3. **Art/metadata:** the metadata, vector logo, trait names, and renderer are compiled into the contract. There are no post-deployment art/description setters. Review these sources and art preview before deploying.
4. **Sale opener control:** the address must be able to send `startSale()` at the X Space. Activation is irreversible and cannot be rescheduled, paused, or handed to another address.

The contract has no general owner/admin, no price/supply/royalty setters, and no reserve or holder-only mint. All 2,121 IDs are public mint inventory. Mint proceeds are forwarded immediately to the immutable treasury; there is no withdraw-to-arbitrary-address method. ERC-2981 reports 5% to the same receiver, but third-party marketplaces may choose whether to honor royalties.

## Recommended operator steps

1. Review `README.md` and the approvals above.
2. Run `npm install && npm test` locally. Do not deploy if any test fails.
3. Inspect `contracts/BroCodeBros2121.sol`, the generated `build/BroCodeBros2121.artifact.json`, and the actual `previewSVG` set. Confirm the displayed logo and visual direction.
4. Prepare a dedicated deployer wallet, treasury, and RPC. Do not paste a private key into the browser, source code, shared terminal log, or a committed `.env` file.
5. Deploy to a test environment first if desired (Cronos testnet chain ID 338); verify constructor wiring, metadata, mint flow, and treasury receipts. A test deployment is not the production contract.
6. Deploy once to Cronos mainnet chain ID 25. Verify the address, constructor input, bytecode, and transaction receipt on a Cronos explorer. Record the deployment transaction and deployed contract address.
7. Give the site maintainer the confirmed address and `release/BroCodeBros2121.abi.json`. Test the art-only gallery and wallet mint against the actual contract.
8. At the future X Space, the treasury address submits `startSale()` once. Confirm `saleStarted() == true`; the contract accepts public mints immediately afterward.

## Deployment helper

`npm run deploy` requires local `CRONOS_RPC_URL` and `DEPLOYER_PRIVATE_KEY`. It defaults to dry-run and prints the chain, deployer, and immutable receiver. The script sends nothing unless the operator explicitly sets:

```sh
BROCODE_DEPLOY_CONFIRM=DEPLOY-25
```

For a testnet run, set `CRONOS_CHAIN_ID=338` and the matching confirmation flag. Do not use the mainnet flag against a testnet or vice versa. `BRO_TREASURY_ADDRESS` can override the default, but doing so changes the permanent payout, royalty, and sale-opener address together.

## What is not included

- No transaction was broadcast and no live contract address is known.
- No modification or deployment of `brocode.surge.sh` was performed.
- No exchange/marketplace listing request was submitted.
- No guarantee that a marketplace will display `contractURI()` or enforce ERC-2981.
- No legal, financial, security-audit, or third-party wallet-compatibility certification. Commission an independent Solidity review before mainnet.
