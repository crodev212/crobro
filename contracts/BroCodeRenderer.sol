// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Standalone renderer for testing/measurement only; the collection embeds this logic.
contract BroCodeRenderer {
    error InvalidTokenId();
    uint256 internal constant MAX_SUPPLY = 2121;

    bytes internal constant ROM = hex"0c0400004040860000180000260c05000040408800001b1c00110a04000040400e052d050c0a05000040400c062705110a04000040400e051106270905000040404a340c0909040000404046201f1d0905000040406a201f1c09a30e2432243c40044009a30b2535253d40034009a30a2436243d40034009a30c2434243b40054009a30a2436243d40034009a3092337233e40024014031b200a0d001d21060be30727090fe00929070b14031b200a0d001d21060be30727090fe00929070b14031b200a0d001d21060be30727090fe00929070b14031b200a0d001d21060be30727090fe00929070b14031b200a0d001d21060be30727090fe00929070b14031b200a0d001d21060be30727090fe00929070b09b3112a2f2a35400b4009a40f2931293840084009b31029302936400a4009b31029302936400a4009a30e2832283940074009a30e2832283940074007ca162720312a2707ca162720312a2707ca162720302a2707cb152620302b2607ca1526202f2b2607c61526202f2b2612a3100c300c2e23202aa0130e2d0e2b21202712a30f0c310c2f24202aa0120e2e0e2c22202712a3120d2e0d2c222028a0150f2b0f2a20202512a3100c300c2e24202aa0130e2d0e2b20202512a3100c300c2e23202aa0130e2d0e2b21202712bf100c300c2e23202aaa130e2d0e2b21202705f31617050305f01617050305f41617050305ea1616050405ea1616050405ee1617050305f41612070205f41611070205f31612070205f41611070205ea1612070207d4181e2022281e07d4191f2121271d09b4171d291d2724192409b4171d291d2724192409b3171d291d2723192309b3161d2a1d2725192509b411101705220c1d100793121018051c100514140b180509ab12101705230a1f110786121118071d11078a121119031e110ea4100c300c2d0513050611081d070ea4100c300c2d0513050611081d070eb3100c300c2d0513050611081d070ea4100d300d2d0513050712081c0710aa120e2e0e2c05260b8b120e1403190e086a20090f6b20090c0af312160b07ea151805040af312160b07f1151705010af312160b07ea151805040af312160b07e8151805040aea11150d08f31518050209a005291026152f113509a0042911261630103609a008270e270f30083009a0062a11271632113609a6052a10281531103609ac052a1028153110360468060702044a080e03050d0411020a078802150812061c046a201f1e00050a01013e02050601013e02050b01013e02050901013e02050a00004002012303253233093c7265637420783d27052720793d2709272077696474683d270a27206865696768743d2708272066696c6c3d271027206f7061636974793d272e34272f3e03272f3e0c3c636972636c652063783d2706272063793d27052720723d270a27207374726f6b653d272027207374726f6b652d77696474683d2732272066696c6c3d276e6f6e65272f3e113c706f6c79676f6e20706f696e74733d270a3c7061746820643d274d593c73766720786d6c6e733d27687474703a2f2f7777772e77332e6f72672f323030302f737667272076696577426f783d27302030203634203634272073686170652d72656e646572696e673d2763726973704564676573273e063c2f7376673e2b646174613a6170706c69636174696f6e2f6a736f6e3b757466382c7b226e616d65223a222442524f532023cb222c226465736372697074696f6e223a2254686520666973742062756d70206f662043726f6e6f732e204f6e2d636861696e2043524f2042524f20434f4445206176617461722e204d696e742036392043524f3b20636170203130207065722077616c6c65743b206e6f20686f6c64657220616c6c6f636174696f6e2e222c2265787465726e616c5f75726c223a2268747470733a2f2f62726f636f64652e73757267652e73682f222c22696d616765223a22646174613a696d6167652f7376672b786d6c3b757466382c55222c22636f6c6c656374696f6e223a7b226e616d65223a222442524f53222c2266616d696c79223a2243524f2042524f20434f4445227d2c2261747472696275746573223a5b7b2274726169745f74797065223a2212227d2c7b2274726169745f74797065223a220b222c2276616c7565223a2221227d2c7b2274726169745f74797065223a22312f31222c2276616c7565223a222304227d5d7d0643726f6e6f7309466973742042756d70064d61726b657408477265656e2055700852656420446f776e04476f6c64044d6f6f6e0747656e6573697307436c6173736963065374726565740347796d064a6572736579094d6f6f6e2053756974084368616d70696f6e0354616e0653756e6c69740642726f6e7a6504446565700450616c6504426c75650742524f2054656506486f6f646965064a657273657909477265656e20546565044d6f6f6e09476f6c6420566573740a476f6c6420436861696e05436861696e0842524f20436f696e06446f75626c65074469616d6f6e640643726f6e6f7307436c6173736963034a617705436869626905426561726404426c756504476f6c640642726967687407466f637573656405486170707905537461727304436f696e054c61736572085374726169676874065261697365640342726f044172636804476f6c6405536d696c6505536d69726b044772696e06546f6e677565054772696c6c054c61756768055377656570065370696b65730443726f7005426c6f6e6404426c756504476f6c6408426c75652043617008536e61706261636b0743524f20436170084d6f6f6e204861740543726f776e0448616c6f0b436f696e205368616465730653686164657309436f696e204c656e7309426c7565204c656e7304476f6c64044669737409466973742042756d70065468756d627304436f696e074469616d6f6e640643616e646c65054368696c6c05436f696e730450756d700542757273740441757261044e6f6e65084469616d6f6e6473084d6f6f6e73686f740747656e65736973084368616d70696f6e03312f3106436f6d6d6f6e08556e636f6d6d6f6e04526172650445706963094c6567656e6461727903312f310a4261636b67726f756e6404426f647904536b696e08436c6f7468696e67094163636573736f7279044661636504457965730542726f7773054d6f757468044861697208486561647765617207457965776561720448616e64075370656369616c094c6567656e646172790b52617269747920546965725545055545555557553404023444434655430303453332375521102423224524553424051245544555453043025445565545055041535447552210342324213355134201023332225534043235454355554500444454353655233303021220445543030545355457551221342423133155444405024445465515054343545252553302023245342555243024021341435545452122545557553111333332233455454555425554563036313038313035663137663339663464666663306666383062343566356432336634336666666262623435363131313432313733326664623263376638303938373036333964661619181419161513181914131f191513101112131b08070400080e141a20262c31373d43484e5359";
    uint256 internal constant OFF_STR   = 930;
    uint256 internal constant OFF_SPEC  = 2371;
    uint256 internal constant OFF_PAL   = 2539;
    uint256 internal constant OFF_SKIN  = 2611;
    uint256 internal constant OFF_LBASE = 2635;

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
