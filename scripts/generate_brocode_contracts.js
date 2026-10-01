// CRO BRO CODE 2121 contract generator.
// Builds a compact on-chain SVG/metadata ROM and injects it into one ERC-721 contract.

const fs = require('fs');
const path = require('path');

fs.mkdirSync(path.join(__dirname, '../contracts'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '../build'), { recursive: true });

const { STATIC_COLORS, C, SKIN_PALETTES, LAYERS, enforceCompatibility, ONE_OF_ONE_CONFIGS } = require('./brocode_traits');

// Unified length-prefixed entry table starting at offset 0 of ROM:
// Indices 0..88:    89 SVG trait bytecode sequences
// Indices 89..177:  89 trait names
// Indices 178..183: 6 rarity tier names
// Indices 184..199: 15 layer category names + "Rarity Tier"
// Indices 200..224: 25 SVG & JSON template strings
const svgDictBytes = [];
const traitNameBytes = [];
const layerBaseIndex = [];
let runningIdx = 0;

for (let l = 0; l < LAYERS.length; l++) {
  layerBaseIndex.push(runningIdx);
  for (let t = 0; t < LAYERS[l].traits.length; t++) {
    const tr = LAYERS[l].traits[t];
    svgDictBytes.push(tr.bytes.length, ...tr.bytes);
    const nameBuf = Buffer.from(tr.name, 'utf8');
    traitNameBytes.push(nameBuf.length, ...nameBuf);
    runningIdx++;
  }
}
// 16th entry of layerBaseIndex is 89 (so 89 + 89 + rarityTier = 178 + rarityTier)
layerBaseIndex.push(89);

const TIER_NAMES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', '1/1'];
const tierNameBytes = [];
for (const tn of TIER_NAMES) {
  const b = Buffer.from(tn, 'utf8');
  tierNameBytes.push(b.length, ...b);
}

const catNameBytes = [];
for (let l = 0; l < LAYERS.length; l++) {
  const b = Buffer.from(LAYERS[l].category, 'utf8');
  catNameBytes.push(b.length, ...b);
}
const rtBuf = Buffer.from('Rarity Tier', 'utf8');
catNameBytes.push(rtBuf.length, ...rtBuf);

const TEMPLATES = [
  /* 0  */ '#',
  /* 1  */ '%23',
  /* 2  */ "<rect x='",
  /* 3  */ "' y='",
  /* 4  */ "' width='",
  /* 5  */ "' height='",
  /* 6  */ "' fill='",
  /* 7  */ "' opacity='.4'/>",
  /* 8  */ "'/>",
  /* 9  */ "<circle cx='",
  /* 10 */ "' cy='",
  /* 11 */ "' r='",
  /* 12 */ "' stroke='",
  /* 13 */ "' stroke-width='2' fill='none'/>",
  /* 14 */ "<polygon points='",
  /* 15 */ "<path d='M",
  /* 16 */ "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' shape-rendering='crispEdges'>",
  /* 17 */ "</svg>",
  /* 18 */ 'data:application/json;utf8,{"name":"$BROS #',
  /* 19 */ '","description":"The fist bump of Cronos. On-chain CRO BRO CODE avatar. Mint 69 CRO; cap 10 per wallet; no holder allocation.","external_url":"https://brocode.surge.sh/","image":"data:image/svg+xml;utf8,',
  /* 20 */ '","collection":{"name":"$BROS","family":"CRO BRO CODE"},"attributes":[{"trait_type":"',
  /* 21 */ '"},{"trait_type":"',
  /* 22 */ '","value":"',
  /* 23 */ '"},{"trait_type":"1/1","value":"#',
  /* 24 */ '"}]}'
];

const tplBytes = [];
for (const s of TEMPLATES) {
  const b = Buffer.from(s, 'utf8');
  tplBytes.push(b.length, ...b);
}

// Pack 21 1/1 configs (21 * 8 = 168 bytes)
const specialConfigBytes = [];
for (let i = 0; i < 21; i++) {
  const L = enforceCompatibility([...ONE_OF_ONE_CONFIGS[i].layers]);
  let packed = 0n;
  for (let k = 0; k < 15; k++) packed |= (BigInt(L[k] & 0x0f) << BigInt(k * 4));
  packed |= (5n << 60n);
  for (let b = 7; b >= 0; b--) specialConfigBytes.push(Number((packed >> BigInt(b * 8)) & 0xffn));
}

const paletteBytes = Array.from(Buffer.from(STATIC_COLORS.slice(4).join(''), 'utf8'));
const skinPaletteBytes = SKIN_PALETTES.flat();
const allStringsBytes = [...tplBytes, ...traitNameBytes, ...tierNameBytes, ...catNameBytes];

const OFF_SVG   = 0;
const OFF_STR   = OFF_SVG + svgDictBytes.length;
const OFF_SPEC  = OFF_STR + allStringsBytes.length;
const OFF_PAL   = OFF_SPEC + specialConfigBytes.length;
const OFF_SKIN  = OFF_PAL + paletteBytes.length;
const OFF_LBASE = OFF_SKIN + skinPaletteBytes.length;

const ROM_BYTES = [
  ...svgDictBytes,
  ...allStringsBytes,
  ...specialConfigBytes,
  ...paletteBytes,
  ...skinPaletteBytes,
  ...layerBaseIndex
];

console.log('Total Unified ROM Size:', ROM_BYTES.length, 'bytes');
console.log('  - svgDictBytes:', svgDictBytes.length);
console.log('  - traitNameBytes:', traitNameBytes.length);
console.log('  - tier+catNameBytes:', tierNameBytes.length + catNameBytes.length);
console.log('  - tplBytes:', tplBytes.length);
console.log('  - specialConfigBytes (21 1/1s):', specialConfigBytes.length);
console.log('  - palette+skin+lbase:', paletteBytes.length + skinPaletteBytes.length + layerBaseIndex.length);

const romHex = Buffer.from(ROM_BYTES).toString('hex');

const rendererLogicBody = `
    bytes internal constant ROM = hex"${romHex}";
    uint256 internal constant OFF_STR   = ${OFF_STR};
    uint256 internal constant OFF_SPEC  = ${OFF_SPEC};
    uint256 internal constant OFF_PAL   = ${OFF_PAL};
    uint256 internal constant OFF_SKIN  = ${OFF_SKIN};
    uint256 internal constant OFF_LBASE = ${OFF_LBASE};

    function _computeTraits(uint256 tokenId, uint256 seed) internal pure returns (uint64 packed, uint8 oneOfOneId, uint256 romPtr) {
        if (tokenId == 0 || tokenId > MAX_SUPPLY) revert InvalidTokenId();
        bytes memory rom = ROM;
        assembly ("memory-safe") {
            romPtr := add(rom, 32)
            let rank := sub(tokenId, 1)
            for {} 1 {} {
                for { let i := 0 } lt(i, 4) { i := add(i, 1) } {
                    mstore(0x00, seed)
                    mstore(0x20, or(and(rank, 0x3F), shl(8, i)))
                    rank := or(shl(6, and(rank, 0x3F)), xor(and(shr(6, rank), 0x3F), and(keccak256(0x00, 0x40), 0x3F)))
                }
                if lt(rank, 2121) { break }
            }

            oneOfOneId := 255
            switch lt(rank, 21)
            case 1 {
                packed := shr(192, mload(add(romPtr, add(OFF_SPEC, mul(rank, 8)))))
                oneOfOneId := rank
            }
            default {
                mstore(0x00, seed)
                mstore(0x20, rank)
                let rnd := keccak256(0x00, 0x40)

                let tier := 0
                let tierIdx := sub(rank, 1221)
                if lt(rank, 1221) { tier := 1 tierIdx := sub(rank, 571) }
                if lt(rank, 571)  { tier := 2 tierIdx := sub(rank, 221) }
                if lt(rank, 221)  { tier := 3 tierIdx := sub(rank, 71)  }
                if lt(rank, 71)   { tier := 4 tierIdx := sub(rank, 21)  }

                let u := and(add(mul(tierIdx, 613), seed), 0x3FF)
                let p := or(shl(52, tier), shl(60, tier))
                if eq(tier, 4) {
                    p := or(p, shl(56, add(1, mod(tierIdx, 4))))
                }
                for { let i := 0 } lt(i, 13) { i := add(i, 1) } {
                    let v := and(shr(mul(i, 4), rnd), 3)
                    if lt(i, 5) { v := and(shr(mul(i, 2), u), 3) }
                    if and(iszero(tier), iszero(lt(i, 5))) { v := and(v, 1) }
                    if and(eq(tier, 2), and(iszero(lt(i, 5)), iszero(v))) { v := 3 }
                    if gt(tier, 2) {
                        let ts := sub(tier, 2)
                        let addV := ts
                        if iszero(i) { addV := add(ts, 2) }
                        if or(eq(i, 7), eq(i, 11)) { addV := sub(ts, eq(v, 3)) }
                        v := add(v, addV)
                    }
                    p := or(p, shl(mul(i, 4), v))
                }

                function setN(pk, sh, v) -> np {
                    np := or(and(pk, not(shl(sh, 15))), shl(sh, v))
                }
                let l10 := and(shr(40, p), 15)
                if and(or(eq(l10, 2), eq(l10, 3)), gt(and(shr(36, p), 15), 2)) {
                    p := setN(p, 36, mul(2, eq(l10, 3)))
                }
                let l11 := and(shr(44, p), 15)
                if and(gt(l11, 2), gt(and(shr(24, p), 15), 2)) {
                    p := setN(p, 24, 2)
                }
                if and(eq(l11, 3), gt(and(shr(28, p), 15), 2)) {
                    p := setN(p, 28, 0)
                }
                if and(eq(and(shr(20, p), 15), 4), eq(and(shr(32, p), 15), 1)) {
                    p := setN(p, 32, 2)
                }
                if and(lt(and(shr(4, p), 15), 2), gt(and(shr(48, p), 15), 3)) {
                    p := setN(p, 48, 3)
                }
                if and(eq(and(shr(12, p), 15), 4), eq(and(shr(16, p), 15), 1)) {
                    p := setN(p, 16, 0)
                }
                packed := p
            }
        }
    }

    function _render(uint256 tokenId, uint256 seed, bool fullUri) internal pure returns (string memory) {
        (uint64 packed, uint8 oneOfOneId, uint256 romPtr) = _computeTraits(tokenId, seed);
        bytes memory buf = new bytes(4096);
        assembly ("memory-safe") {
            mstore(0x00, romPtr)
            mstore(0x20, or(and(shr(8, packed), 15), shl(8, fullUri)))
            let dst := add(buf, 32)

            function wNum(d, v) -> nd {
                if gt(v, 9) { d := wNum(d, div(v, 10)) }
                mstore8(d, add(48, mod(v, 10)))
                nd := add(d, 1)
            }
            function wStr(d, targetIdx) -> nd {
                let cur := add(mload(0x00), OFF_STR)
                for { let idx := 0 } lt(idx, targetIdx) { idx := add(idx, 1) } {
                    cur := add(cur, add(1, byte(0, mload(cur))))
                }
                let len := byte(0, mload(cur))
                for { let i := 0 } lt(i, len) { i := add(i, 32) } {
                    mstore(add(d, i), mload(add(cur, add(1, i))))
                }
                nd := add(d, len)
            }
            function wTN(d, tplIdx, num) -> nd {
                nd := wNum(wStr(d, tplIdx), num)
            }
            function wColEnd(d, preTpl, cIdx, postTpl) -> nd {
                let st := mload(0x20)
                nd := wStr(wStr(d, preTpl), shr(8, st))
                let rPtr := mload(0x00)
                if lt(cIdx, 4) {
                    cIdx := byte(0, mload(add(rPtr, add(OFF_SKIN, add(mul(and(st, 15), 4), cIdx)))))
                }
                mstore(nd, mload(add(rPtr, add(OFF_PAL, mul(sub(cIdx, 4), 3)))))
                nd := wStr(add(nd, 3), postTpl)
            }
            function wRectWord(d, w32, col, post) -> nd {
                for { let i := 0 } lt(i, 4) { i := add(i, 1) } {
                    d := wTN(d, add(2, i), byte(i, w32))
                }
                nd := wColEnd(d, 6, col, post)
            }

            if fullUri {
                dst := wStr(wTN(dst, 18, tokenId), 19)
            }
            dst := wStr(dst, 16)
            for { let layer := 0 } lt(layer, 15) { layer := add(layer, 1) } {
                let cur := mload(0x00)
                let target := add(byte(0, mload(add(cur, add(OFF_LBASE, layer)))), and(shr(mul(layer, 4), packed), 15))
                for { let k := 0 } lt(k, target) { k := add(k, 1) } {
                    cur := add(cur, add(1, byte(0, mload(cur))))
                }
                let end := add(cur, add(1, byte(0, mload(cur))))
                cur := add(cur, 1)
                for {} lt(cur, end) {} {
                    let hdr := byte(0, mload(cur))
                    cur := add(cur, 1)
                    let op := shr(5, hdr)
                    let col := and(hdr, 31)
                    if or(lt(op, 2), eq(op, 7)) {
                        let w32 := mload(cur)
                        cur := add(cur, 4)
                        dst := wRectWord(dst, w32, col, sub(8, eq(op, 1)))
                        if eq(op, 7) {
                            let mx := sub(sub(64, byte(0, w32)), byte(2, w32))
                            dst := wRectWord(dst, or(and(w32, not(shl(248, 0xFF))), shl(248, mx)), col, 8)
                        }
                    }
                    if and(gt(op, 1), lt(op, 4)) {
                        let w32 := mload(cur)
                        cur := add(cur, 3)
                        for { let i := 0 } lt(i, 3) { i := add(i, 1) } {
                            dst := wTN(dst, add(9, i), byte(i, w32))
                        }
                        let isS := eq(op, 3)
                        dst := wColEnd(dst, add(6, mul(isS, 6)), col, add(8, mul(isS, 5)))
                    }
                    if and(gt(op, 3), lt(op, 7)) {
                        let isP := eq(op, 6)
                        let pts := add(3, eq(op, 5))
                        dst := wStr(dst, add(14, isP))
                        for { let pt := 0 } lt(pt, pts) { pt := add(pt, 1) } {
                            if gt(pt, 0) {
                                mstore8(dst, add(32, mul(isP, 44)))
                                dst := add(dst, 1)
                            }
                            dst := wNum(dst, byte(0, mload(cur)))
                            mstore8(dst, sub(44, mul(isP, 12)))
                            dst := wNum(add(dst, 1), byte(1, mload(cur)))
                            cur := add(cur, 2)
                        }
                        dst := wColEnd(dst, add(6, mul(isP, 6)), col, add(8, mul(isP, 5)))
                    }
                }
            }
            if lt(oneOfOneId, 21) {
                let cx := add(4, and(oneOfOneId, 7))
                let cy := add(4, shr(1, oneOfOneId))
                let w1 := or(or(shl(248, cx), shl(240, cy)), shl(224, 0x0404))
                dst := wRectWord(dst, w1, add(14, and(oneOfOneId, 15)), 8)
            }
            dst := wStr(dst, 17)

            if fullUri {
                for { let i := 0 } lt(i, 16) { i := add(i, 1) } {
                    dst := wStr(dst, sub(21, iszero(i)))
                    dst := wStr(dst, add(120, i))
                    dst := wStr(dst, 22)
                    let tIdx := add(25, add(byte(0, mload(add(romPtr, add(OFF_LBASE, i)))), and(shr(mul(i, 4), packed), 15)))
                    dst := wStr(dst, tIdx)
                }
                if lt(oneOfOneId, 21) {
                    dst := wTN(dst, 23, add(oneOfOneId, 1))
                }
                dst := wStr(dst, 24)
            }
            mstore(dst, 0)
            mstore(buf, sub(dst, add(buf, 32)))
        }
        return string(buf);
    }
`;

const vexelRendererSol = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title VexelRenderer
 * @notice Standalone On-Chain SVG & Metadata Rendering Engine for the 2,121-piece VEXEL-2121 collection.
 */
contract VexelRenderer {
    error InvalidTokenId();
    uint256 internal constant MAX_SUPPLY = 2121;
${rendererLogicBody}
    function getTraits(uint256 tokenId, uint256 seed) external pure returns (uint64 packed, uint8 rarityTier, uint8 oneOfOneId) {
        (packed, oneOfOneId, ) = _computeTraits(tokenId, seed);
        rarityTier = uint8((packed >> 60) & 0x0F);
    }

    function renderSVG(uint256 tokenId, uint256 seed) external pure returns (string memory) {
        return _render(tokenId, seed, false);
    }

    function tokenURI(uint256 tokenId, uint256 seed) external pure returns (string memory) {
        return _render(tokenId, seed, true);
    }
}
`;

const broRendererSol = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Standalone renderer for testing/measurement only; the collection embeds this logic.
contract BroCodeRenderer {
    error InvalidTokenId();
    uint256 internal constant MAX_SUPPLY = 2121;
${rendererLogicBody}
    function getTraits(uint256 tokenId, uint256 seed) external pure returns (uint64 packed, uint8 rarityTier, uint8 oneOfOneId) {
        (packed, oneOfOneId, ) = _computeTraits(tokenId, seed);
        rarityTier = uint8((packed >> 60) & 0x0F);
    }
    function renderSVG(uint256 tokenId, uint256 seed) external pure returns (string memory) {
        return _render(tokenId, seed, false);
    }
    function tokenURI(uint256 tokenId, uint256 seed) external pure returns (string memory) {
        return _render(tokenId, seed, true);
    }
}
`;

const broCodeBaseSol = fs.readFileSync(path.join(__dirname, '../contracts/BroCodeBase.sol'), 'utf8');
const integratedRenderer = `${rendererLogicBody}
    function getTraits(uint256 tokenId) external view returns (uint64 packed, uint8 rarityTier, uint8 oneOfOneId) {
        ownerOf(tokenId);
        (packed, oneOfOneId, ) = _computeTraits(tokenId, collectionSeed);
        rarityTier = uint8((packed >> 60) & 0x0F);
    }
    /// @notice Read-only art preview, available for unminted IDs 1..2121.
    function previewSVG(uint256 tokenId) external pure returns (string memory) {
        return _render(tokenId, collectionSeed, false);
    }
    function renderSVG(uint256 tokenId) external pure returns (string memory) {
        return _render(tokenId, collectionSeed, false);
    }
    /// @notice Standard metadata URI is available after a token is minted.
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        ownerOf(tokenId);
        return _render(tokenId, collectionSeed, true);
    }
`;
if (!broCodeBaseSol.includes('/*__RENDERER_LOGIC__*/')) throw new Error('Missing renderer injection marker');
const broCodeSol = broCodeBaseSol.replace('/*__RENDERER_LOGIC__*/', integratedRenderer);

fs.writeFileSync(path.join(__dirname, '../contracts/BroCodeRenderer.sol'), broRendererSol);
fs.writeFileSync(path.join(__dirname, '../contracts/BroCodeBros2121.sol'), broCodeSol);
fs.writeFileSync(path.join(__dirname, '../build/trait_definitions.json'), JSON.stringify({
  collection: '$BROS', symbol: 'BROS', STATIC_COLORS, SKIN_PALETTES, LAYERS, ONE_OF_ONE_CONFIGS, TIER_NAMES,
  layerBaseIndex, offsets: { OFF_SVG, OFF_STR, OFF_SPEC, OFF_PAL, OFF_SKIN, OFF_LBASE },
  stats: {
    romTotalBytes: ROM_BYTES.length,
    svgDictByteLength: svgDictBytes.length,
    traitNameByteLength: traitNameBytes.length,
    catAndTierByteLength: tierNameBytes.length + catNameBytes.length,
    templateByteLength: tplBytes.length,
    specialConfigsByteLength: specialConfigBytes.length,
    paletteByteLength: paletteBytes.length + skinPaletteBytes.length,
    layerBaseByteLength: layerBaseIndex.length
  }
}, null, 2));

console.log('Generated BroCodeRenderer.sol (measurement only) and BroCodeBros2121.sol (single deployment).');
console.log('Trait count:', runningIdx, '| Unified ROM:', ROM_BYTES.length, 'bytes | Layers:', LAYERS.length);
