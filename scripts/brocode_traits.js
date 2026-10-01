// CRO BRO CODE on-chain trait dictionary.
// Every shape is authored as compact SVG primitives; no raster or external asset is embedded.
const STATIC_COLORS = [
  '000', '000', '000', '000',
  '061', '081', '05f', '17f', '39f', '4df', 'fc0', 'ff8',
  '0b4', '5f5', 'd23', 'f43', 'fff', 'bbb', '456', '111',
  '421', '732', 'fdb', '2c7', 'f80', '987', '063', '9df'
];

const C = {
  P1: 0, P2: 1, P3: 2, DARK: 3,
  NAVY: 4, MIDNIGHT: 5, BLUE: 6, COBALT: 7, SKY: 8, CYAN: 9,
  GOLD: 10, SUN: 11, GREEN: 12, LIME: 13, RED: 14, ORANGE_RED: 15,
  WHITE: 16, SILVER: 17, GREY: 18, BLACK: 19, BROWN: 20, BROWN2: 21,
  PEACH: 22, EMERALD: 23, ORANGE: 24, TAN: 25, DEEP_GREEN: 26,
  ICE: 27, PINK: 28, STEEL: 29, PURPLE: 30, BRONZE: 31
};

const SKIN_PALETTES = [
  [C.PEACH, C.TAN, C.ORANGE, C.BROWN],       // warm tan
  [C.TAN, C.PEACH, C.BROWN2, C.BLACK],       // sunlit tan
  [C.ORANGE, C.TAN, C.BROWN, C.BLACK],      // deep bronze
  [C.BRONZE, C.TAN, C.BROWN2, C.BLACK],     // warm brown
  [C.WHITE, C.SILVER, C.GREY, C.BLACK],      // pale comic ink
  [C.ICE, C.SKY, C.COBALT, C.NAVY]           // blue mascot variant
];

const rect  = (c, x, y, w, h) => [(0 << 5) | c, x, y, w, h];
const rAlph = (c, x, y, w, h) => [(1 << 5) | c, x, y, w, h];
const circ  = (c, cx, cy, r)  => [(2 << 5) | c, cx, cy, r];
const ring  = (c, cx, cy, r)  => [(3 << 5) | c, cx, cy, r];
const tri   = (c, x1, y1, x2, y2, x3, y3) => [(4 << 5) | c, x1, y1, x2, y2, x3, y3];
const quad  = (c, x1, y1, x2, y2, x3, y3, x4, y4) => [(5 << 5) | c, x1, y1, x2, y2, x3, y3, x4, y4];
const spath = (c, x1, y1, x2, y2, x3, y3) => [(6 << 5) | c, x1, y1, x2, y2, x3, y3];
const mrect = (c, x, y, w, h) => [(7 << 5) | c, x, y, w, h];
const seq   = (...shapes) => shapes.flat();

// 15 layers, 89 total traits. Trait order is significant to the packed renderer.
const LAYERS = [
  { category: 'Background', traits: [
    { id: 0, name: 'Cronos Blue', rarity: 'Common', bytes: seq(
      rect(C.NAVY,0,0,64,64), tri(C.BLUE,0,0,24,0,0,38), tri(C.COBALT,64,0,40,0,64,38),
      tri(C.BLUE,0,64,26,40,0,50), tri(C.COBALT,64,64,38,42,64,52), rect(C.MIDNIGHT,0,57,64,7)
    )},
    { id: 1, name: 'Fist Bump Burst', rarity: 'Common', bytes: seq(
      rect(C.MIDNIGHT,0,0,64,64), tri(C.SKY,0,0,27,28,0,17), tri(C.BLUE,64,0,37,27,64,16),
      tri(C.COBALT,0,64,28,39,0,50), tri(C.BLUE,64,64,36,39,64,50), circ(C.NAVY,32,31,24)
    )},
    { id: 2, name: 'Midnight Market', rarity: 'Uncommon', bytes: seq(
      rect(C.NAVY,0,0,64,64), rect(C.RED,5,45,5,12), rect(C.ORANGE_RED,7,42,2,3),
      rect(C.GREEN,53,17,5,40), rect(C.LIME,55,12,2,5), rect(C.MIDNIGHT,0,57,64,7)
    )},
    { id: 3, name: 'Green Candle Rise', rarity: 'Uncommon', bytes: seq(
      rect(C.MIDNIGHT,0,0,64,64), rect(C.GREEN,6,39,5,17), rect(C.LIME,8,34,2,5),
      rect(C.GREEN,50,23,6,33), rect(C.LIME,52,15,2,8), rect(C.BLUE,0,56,64,8)
    )},
    { id: 4, name: 'Red Wick Dip', rarity: 'Rare', bytes: seq(
      rect(C.NAVY,0,0,64,64), rect(C.RED,5,17,6,39), rect(C.ORANGE_RED,7,12,2,5),
      rect(C.RED,51,37,6,19), rect(C.ORANGE_RED,53,31,2,6), rect(C.MIDNIGHT,0,57,64,7)
    )},
    { id: 5, name: 'Gold Rush', rarity: 'Rare', bytes: seq(
      rect(C.MIDNIGHT,0,0,64,64), circ(C.GOLD,52,12,9), ring(C.SUN,52,12,7),
      circ(C.BRONZE,52,12,4), mrect(C.SKY,5,8,2,20)
    )},
    { id: 6, name: 'Moon Mission', rarity: 'Epic', bytes: seq(
      rect(C.NAVY,0,0,64,64), circ(C.BLUE,32,31,29), circ(C.NAVY,40,24,22),
      circ(C.GOLD,52,12,7), ring(C.SUN,52,12,5), mrect(C.CYAN,4,15,2,12)
    )},
    { id: 7, name: 'Genesis Neon', rarity: 'Legendary', bytes: seq(
      rect(C.MIDNIGHT,0,0,64,64), ring(C.GOLD,32,31,28), ring(C.BLUE,32,31,24),
      tri(C.SKY,0,0,18,0,0,30), tri(C.SKY,64,0,46,0,64,30), rect(C.GOLD,0,0,64,2)
    )}
  ]},
  { category: 'Body', traits: [
    { id: 0, name: 'Classic Bro', rarity: 'Common', bytes: seq(
      quad(C.DARK,14,36,50,36,60,64,4,64), quad(C.BLACK,18,40,46,40,54,64,10,64)
    )},
    { id: 1, name: 'Street Fit', rarity: 'Common', bytes: seq(
      quad(C.DARK,11,37,53,37,61,64,3,64), quad(C.BLUE,15,41,49,41,55,64,9,64), rect(C.BLACK,24,42,16,22)
    )},
    { id: 2, name: 'Gym Bro', rarity: 'Uncommon', bytes: seq(
      quad(C.DARK,10,36,54,36,61,64,3,64), quad(C.BROWN,15,39,49,39,55,64,9,64), rect(C.BLACK,23,47,18,17)
    )},
    { id: 3, name: 'CRO Jersey', rarity: 'Rare', bytes: seq(
      quad(C.DARK,12,36,52,36,59,64,5,64), quad(C.BLUE,16,40,48,40,54,64,10,64), rect(C.WHITE,29,42,6,22), rect(C.GOLD,18,54,28,3)
    )},
    { id: 4, name: 'Moon Suit', rarity: 'Epic', bytes: seq(
      quad(C.DARK,10,36,54,36,61,64,3,64), quad(C.NAVY,15,40,49,40,56,64,8,64), mrect(C.CYAN,19,45,4,17)
    )},
    { id: 5, name: 'Golden Champion', rarity: 'Legendary', bytes: seq(
      quad(C.DARK,9,35,55,35,62,64,2,64), quad(C.GOLD,14,39,50,39,57,64,7,64), rect(C.SUN,25,43,14,18), rect(C.BLACK,28,51,8,13)
    )}
  ]},
  { category: 'Skin', traits: [
    { id: 0, name: 'Warm Tan', rarity: 'Common', bytes: seq(
      rect(C.DARK,27,32,10,13), rect(C.P1,29,33,6,12), quad(C.DARK,8,38,22,37,25,49,12,54), quad(C.P1,10,40,20,39,22,47,14,51), quad(C.DARK,42,37,56,38,52,54,39,49), quad(C.P1,44,39,54,40,50,51,42,47)
    )},
    { id: 1, name: 'Sunlit Tan', rarity: 'Common', bytes: seq(
      rect(C.DARK,26,32,12,13), rect(C.P1,28,33,8,11), quad(C.DARK,7,39,21,36,25,48,12,53), quad(C.P1,10,40,20,39,22,47,14,50), quad(C.DARK,43,36,57,39,52,53,39,48), quad(C.P1,45,39,54,40,50,50,42,47)
    )},
    { id: 2, name: 'Bronze Bro', rarity: 'Uncommon', bytes: seq(
      rect(C.DARK,27,32,10,13), rect(C.P2,29,33,6,12), quad(C.DARK,8,38,22,37,25,49,12,54), quad(C.P1,10,40,20,39,22,47,14,51), quad(C.DARK,42,37,56,38,52,54,39,49), quad(C.P1,44,39,54,40,50,51,42,47)
    )},
    { id: 3, name: 'Deep Brown', rarity: 'Rare', bytes: seq(
      rect(C.DARK,26,32,12,13), rect(C.P1,28,33,8,11), quad(C.DARK,7,38,23,37,26,50,11,54), quad(C.P1,10,40,21,39,23,48,14,51), quad(C.DARK,41,37,57,38,53,54,38,49), quad(C.P1,44,39,54,40,50,51,42,47)
    )},
    { id: 4, name: 'Pale Comic', rarity: 'Epic', bytes: seq(
      rect(C.DARK,27,32,10,13), rect(C.P1,29,33,6,12), quad(C.DARK,8,38,22,37,25,49,12,54), quad(C.P1,10,40,20,39,22,47,14,51), quad(C.DARK,42,37,56,38,52,54,39,49), quad(C.P1,44,39,54,40,50,51,42,47)
    )},
    { id: 5, name: 'Blue Mascot', rarity: 'Legendary', bytes: seq(
      rect(C.DARK,27,32,10,13), rect(C.P1,29,33,6,12), quad(C.DARK,8,38,22,37,25,49,12,54), quad(C.P1,10,40,20,39,22,47,14,51), quad(C.DARK,42,37,56,38,52,54,39,49), quad(C.P1,44,39,54,40,50,51,42,47), rect(C.CYAN,30,37,4,4)
    )}
  ]},
  { category: 'Clothing', traits: [
    { id: 0, name: 'BRO Tee', rarity: 'Common', bytes: seq(
      quad(C.BLACK,17,42,47,42,53,64,11,64), rect(C.BLUE,28,45,8,3), rect(C.GOLD,30,50,4,4)
    )},
    { id: 1, name: 'Blue Hoodie', rarity: 'Common', bytes: seq(
      quad(C.NAVY,15,41,49,41,56,64,8,64), quad(C.BLUE,20,43,44,43,50,64,14,64), mrect(C.SKY,17,47,3,13)
    )},
    { id: 2, name: 'CRO Jersey', rarity: 'Uncommon', bytes: seq(
      quad(C.BLACK,16,41,48,41,54,64,10,64), quad(C.BLUE,20,43,44,43,50,64,14,64), rect(C.WHITE,29,43,6,21), rect(C.GOLD,22,53,20,3)
    )},
    { id: 3, name: 'Green Candle Tee', rarity: 'Rare', bytes: seq(
      quad(C.BLACK,16,41,48,41,54,64,10,64), quad(C.DEEP_GREEN,20,43,44,43,50,64,14,64), rect(C.LIME,23,48,18,3), rect(C.GREEN,28,53,8,7)
    )},
    { id: 4, name: 'Moon Jacket', rarity: 'Epic', bytes: seq(
      quad(C.DARK,14,40,50,40,57,64,7,64), quad(C.BLACK,19,43,45,43,51,64,13,64), mrect(C.GOLD,20,45,3,15), rect(C.BLUE,29,43,6,20)
    )},
    { id: 5, name: 'Gold Champion Vest', rarity: 'Legendary', bytes: seq(
      quad(C.DARK,14,40,50,40,57,64,7,64), quad(C.GOLD,18,43,46,43,51,64,13,64), quad(C.BLACK,26,43,38,43,42,64,22,64), mrect(C.SUN,19,46,2,14)
    )}
  ]},
  { category: 'Accessory', traits: [
    { id: 0, name: 'No Chain', rarity: 'Common', bytes: [] },
    { id: 1, name: 'Gold Chain', rarity: 'Common', bytes: seq(
      spath(C.GOLD,22,39,32,49,42,39), mrect(C.SUN,27,45,2,2)
    )},
    { id: 2, name: 'BRO Coin', rarity: 'Uncommon', bytes: seq(
      spath(C.GOLD,22,39,32,48,42,39), circ(C.GOLD,32,50,5), ring(C.SUN,32,50,3), rect(C.BRONZE,31,48,2,4)
    )},
    { id: 3, name: 'Double Links', rarity: 'Rare', bytes: seq(
      spath(C.SUN,21,38,32,48,43,38), spath(C.GOLD,23,40,32,52,41,40), circ(C.GOLD,32,52,3)
    )},
    { id: 4, name: 'Diamond Pendant', rarity: 'Epic', bytes: seq(
      spath(C.GOLD,21,38,32,47,43,38), quad(C.CYAN,32,46,37,51,32,57,27,51), quad(C.WHITE,32,47,35,51,32,54,29,51)
    )},
    { id: 5, name: 'Cronos Medallion', rarity: 'Legendary', bytes: seq(
      spath(C.BLUE,21,38,32,47,43,38), circ(C.GOLD,32,51,6), ring(C.SUN,32,51,4), circ(C.BLUE,32,51,2)
    )}
  ]},
  { category: 'Face', traits: [
    { id: 0, name: 'Classic Bro', rarity: 'Common', bytes: seq(
      rect(C.DARK,15,12,34,26), circ(C.DARK,17,25,5), circ(C.DARK,47,25,5), quad(C.P1,19,12,45,12,44,32,32,39,20,32), circ(C.P1,17,25,3), circ(C.P1,47,25,3)
    )},
    { id: 1, name: 'Square Jaw', rarity: 'Common', bytes: seq(
      quad(C.DARK,15,11,49,11,48,33,32,40,16,33), quad(C.P1,18,13,46,13,43,32,32,37,21,32), rect(C.P1,18,20,28,10)
    )},
    { id: 2, name: 'Chibi Bro', rarity: 'Uncommon', bytes: seq(
      rect(C.DARK,17,13,30,25), circ(C.DARK,18,25,4), circ(C.DARK,46,25,4), quad(C.P1,20,14,44,14,43,33,32,38,21,33), circ(C.P1,18,25,2), circ(C.P1,46,25,2)
    )},
    { id: 3, name: 'Beard Bro', rarity: 'Rare', bytes: seq(
      rect(C.DARK,15,12,34,27), quad(C.P1,19,14,45,14,43,32,32,38,21,32), quad(C.BROWN,20,28,44,28,40,38,24,38), circ(C.P1,17,25,3), circ(C.P1,47,25,3)
    )},
    { id: 4, name: 'Blue Mascot Face', rarity: 'Epic', bytes: seq(
      rect(C.DARK,15,12,34,27), quad(C.P1,19,14,45,14,43,33,32,38,21,33), rect(C.CYAN,20,24,4,3), rect(C.BLUE,40,24,4,3)
    )},
    { id: 5, name: 'Gold Idol Face', rarity: 'Legendary', bytes: seq(
      rect(C.BRONZE,15,12,34,27), quad(C.GOLD,19,14,45,14,43,33,32,38,21,33), rect(C.SUN,22,17,20,3), circ(C.GOLD,17,25,3), circ(C.GOLD,47,25,3)
    )}
  ]},
  { category: 'Eyes', traits: [
    { id: 0, name: 'Bright Eyes', rarity: 'Common', bytes: seq(
      rect(C.WHITE,22,22,6,4), rect(C.WHITE,36,22,6,4), rect(C.BLACK,24,22,2,4), rect(C.BLACK,38,22,2,4)
    )},
    { id: 1, name: 'Focused Look', rarity: 'Common', bytes: seq(
      quad(C.BLACK,21,21,29,22,28,26,21,25), quad(C.BLACK,35,22,43,21,43,25,36,26), rect(C.WHITE,24,22,3,2), rect(C.WHITE,37,22,3,2)
    )},
    { id: 2, name: 'Happy Eyes', rarity: 'Uncommon', bytes: seq(
      spath(C.BLACK,21,25,25,21,29,25), spath(C.BLACK,35,25,39,21,43,25), circ(C.WHITE,25,25,1), circ(C.WHITE,39,25,1)
    )},
    { id: 3, name: 'Star Eyes', rarity: 'Rare', bytes: seq(
      quad(C.GOLD,25,20,28,23,25,26,22,23), quad(C.GOLD,39,20,42,23,39,26,36,23), rect(C.WHITE,24,22,2,2), rect(C.WHITE,38,22,2,2)
    )},
    { id: 4, name: 'Coin Eyes', rarity: 'Epic', bytes: seq(
      circ(C.GOLD,25,24,4), ring(C.SUN,25,24,3), circ(C.GOLD,39,24,4), ring(C.SUN,39,24,3)
    )},
    { id: 5, name: 'Laser Eyes', rarity: 'Legendary', bytes: seq(
      rect(C.RED,20,23,10,3), rect(C.ORANGE_RED,20,24,10,1), rect(C.RED,34,23,10,3), rect(C.ORANGE_RED,34,24,10,1)
    )}
  ]},
  { category: 'Eyebrows', traits: [
    { id: 0, name: 'Straight Brows', rarity: 'Common', bytes: seq(
      rect(C.BROWN,21,18,8,2), rect(C.BROWN,35,18,8,2)
    )},
    { id: 1, name: 'Raised Brow', rarity: 'Common', bytes: seq(
      quad(C.BROWN,20,19,29,17,29,19,21,21), quad(C.BROWN,35,17,44,19,43,21,35,19)
    )},
    { id: 2, name: 'Bro Brow', rarity: 'Uncommon', bytes: seq(
      quad(C.BLACK,20,18,30,20,29,22,20,20), quad(C.BLACK,34,20,44,18,44,20,35,22)
    )},
    { id: 3, name: 'Confident Arch', rarity: 'Rare', bytes: seq(
      spath(C.BROWN,20,20,24,17,29,19), spath(C.BROWN,35,19,40,17,44,20)
    )},
    { id: 4, name: 'Golden Brows', rarity: 'Epic', bytes: seq(
      quad(C.GOLD,20,19,30,17,29,19,20,21), quad(C.GOLD,34,17,44,19,44,21,35,19)
    )}
  ]},
  { category: 'Mouth', traits: [
    { id: 0, name: 'Easy Smile', rarity: 'Common', bytes: seq(
      spath(C.BROWN,24,30,32,34,40,30), rect(C.WHITE,27,30,10,2)
    )},
    { id: 1, name: 'Smirk', rarity: 'Common', bytes: seq(
      spath(C.BROWN,25,31,33,33,39,29), rect(C.WHITE,29,30,7,2)
    )},
    { id: 2, name: 'Open Grin', rarity: 'Uncommon', bytes: seq(
      quad(C.BROWN,23,29,41,29,39,36,25,36), rect(C.WHITE,26,30,12,3), rect(C.RED,28,34,8,2)
    )},
    { id: 3, name: 'Tongue Out', rarity: 'Rare', bytes: seq(
      quad(C.BROWN,23,29,41,29,39,36,25,36), rect(C.WHITE,26,30,12,2), quad(C.RED,28,33,36,33,35,37,29,37)
    )},
    { id: 4, name: 'Gold Grill', rarity: 'Epic', bytes: seq(
      quad(C.BLACK,23,29,41,29,39,35,25,35), rect(C.GOLD,26,30,12,3), mrect(C.SUN,29,30,1,3)
    )},
    { id: 5, name: 'Big Laugh', rarity: 'Legendary', bytes: seq(
      quad(C.BLACK,22,29,42,29,39,37,25,37), rect(C.WHITE,25,30,14,3), rect(C.RED,28,35,8,2)
    )}
  ]},
  { category: 'Hair', traits: [
    { id: 0, name: 'Dark Sweep', rarity: 'Common', bytes: seq(
      quad(C.BROWN,17,16,23,5,34,12,29,16), quad(C.BROWN,28,14,43,4,47,15,36,17), rect(C.BLACK,20,14,23,3)
    )},
    { id: 1, name: 'Black Spikes', rarity: 'Common', bytes: seq(
      tri(C.BLACK,18,16,24,5,28,16), tri(C.BROWN,25,16,32,3,36,16), tri(C.BLACK,34,16,41,6,45,16)
    )},
    { id: 2, name: 'Brown Crop', rarity: 'Uncommon', bytes: seq(
      rect(C.BROWN,20,11,24,5), mrect(C.BLACK,22,12,3,4)
    )},
    { id: 3, name: 'Blond Quiff', rarity: 'Rare', bytes: seq(
      quad(C.SUN,18,16,23,5,35,10,31,17), quad(C.GOLD,28,15,42,5,46,15,36,17)
    )},
    { id: 4, name: 'Blue Fade', rarity: 'Epic', bytes: seq(
      tri(C.BLUE,18,17,24,7,29,17), tri(C.SKY,27,16,34,4,39,16), rect(C.NAVY,20,14,23,3)
    )},
    { id: 5, name: 'Gold Quiff', rarity: 'Legendary', bytes: seq(
      tri(C.GOLD,18,17,25,3,30,17), tri(C.SUN,28,17,36,4,41,17), rect(C.ORANGE,22,13,18,3)
    )}
  ]},
  { category: 'Headwear', traits: [
    { id: 0, name: 'No Cap', rarity: 'Common', bytes: [] },
    { id: 1, name: 'Blue Snapback', rarity: 'Common', bytes: seq(
      quad(C.NAVY,16,12,48,12,45,5,19,5), rect(C.BLUE,17,8,29,7), rect(C.SKY,20,9,18,2), quad(C.BLUE,17,13,49,13,54,16,17,17), rect(C.GOLD,24,10,3,2)
    )},
    { id: 2, name: 'CRO Cap', rarity: 'Uncommon', bytes: seq(
      quad(C.BLACK,16,12,48,12,45,5,19,5), rect(C.BLUE,17,8,29,7), rect(C.WHITE,22,9,18,2), quad(C.BLUE,17,13,49,13,54,16,17,17), circ(C.GOLD,32,11,2)
    )},
    { id: 3, name: 'Moon Hat', rarity: 'Rare', bytes: seq(
      quad(C.NAVY,16,13,48,13,45,5,19,5), rect(C.COBALT,18,8,28,7), rect(C.GOLD,25,9,14,2), quad(C.BLUE,16,13,48,13,56,16,17,17)
    )},
    { id: 4, name: 'Bro Crown', rarity: 'Epic', bytes: seq(
      quad(C.GOLD,18,14,46,14,44,5,38,11), tri(C.SUN,18,14,20,3,25,14), tri(C.SUN,28,14,32,2,36,14), tri(C.SUN,39,14,45,3,46,14), rect(C.BRONZE,18,13,28,3)
    )},
    { id: 5, name: 'HODL Halo', rarity: 'Legendary', bytes: seq(
      ring(C.GOLD,32,9,15), ring(C.SUN,32,9,12), circ(C.GOLD,18,9,2), circ(C.GOLD,46,9,2)
    )}
  ]},
  { category: 'Eyewear', traits: [
    { id: 0, name: 'No Shades', rarity: 'Common', bytes: [] },
    { id: 1, name: 'Classic Shades', rarity: 'Uncommon', bytes: seq(
      rect(C.BLACK,18,21,28,3), rect(C.BLACK,19,22,11,7), rect(C.BLACK,34,22,11,7), rect(C.SILVER,21,23,7,1), rect(C.SILVER,36,23,7,1), rect(C.BLACK,30,24,4,2)
    )},
    { id: 2, name: 'Coin Lens Shades', rarity: 'Rare', bytes: seq(
      rect(C.BLACK,17,21,30,3), rect(C.BLACK,18,22,12,8), rect(C.BLACK,34,22,12,8), circ(C.GOLD,24,26,3), circ(C.GOLD,40,26,3), rect(C.SUN,22,25,5,1), rect(C.SUN,38,25,5,1)
    )},
    { id: 3, name: 'Blue Lens Shades', rarity: 'Epic', bytes: seq(
      rect(C.BLACK,17,21,30,3), rect(C.BLACK,18,22,12,8), rect(C.BLACK,34,22,12,8), rect(C.SKY,20,24,8,4), rect(C.CYAN,36,24,8,4), rect(C.SILVER,22,23,4,1)
    )},
    { id: 4, name: 'Gold Visor', rarity: 'Legendary', bytes: seq(
      quad(C.BLACK,17,20,47,20,44,30,20,30), quad(C.GOLD,20,22,44,22,42,28,22,28), rect(C.SUN,25,23,14,2), rect(C.BLACK,29,25,6,2)
    )}
  ]},
  { category: 'Hand', traits: [
    { id: 0, name: 'Hands Down', rarity: 'Common', bytes: [] },
    { id: 1, name: 'Fist Bump', rarity: 'Common', bytes: seq(
      quad(C.DARK,2,39,17,36,25,47,19,57), quad(C.P1,5,41,16,38,21,47,17,53), rect(C.P1,8,39,9,6), rect(C.P3,9,42,7,2), rect(C.DARK,3,50,16,3)
    )},
    { id: 2, name: 'Thumbs Up', rarity: 'Uncommon', bytes: seq(
      rect(C.DARK,3,43,17,12), rect(C.P1,5,45,13,8), quad(C.DARK,8,39,13,39,14,46,8,46), rect(C.P1,9,37,4,8), rect(C.P3,6,47,8,2)
    )},
    { id: 3, name: 'BRO Coin Hold', rarity: 'Rare', bytes: seq(
      quad(C.DARK,5,41,18,39,23,50,17,57), quad(C.P1,7,43,16,41,20,50,15,54), circ(C.GOLD,23,45,8), ring(C.SUN,23,45,6), rect(C.BRONZE,22,42,2,6)
    )},
    { id: 4, name: 'Diamond Hand', rarity: 'Epic', bytes: seq(
      quad(C.DARK,2,40,17,37,24,49,18,57), quad(C.BLUE,5,42,16,40,21,49,16,54), quad(C.CYAN,12,39,17,44,12,49,7,44), quad(C.WHITE,12,41,15,44,12,47,9,44)
    )},
    { id: 5, name: 'Candle Surf', rarity: 'Legendary', bytes: seq(
      quad(C.DARK,3,41,18,38,24,51,17,58), quad(C.P1,5,43,16,41,21,51,16,55), rect(C.GREEN,18,43,5,14), rect(C.LIME,19,40,3,3), rect(C.WHITE,19,46,3,2)
    )}
  ]},
  { category: 'Special', traits: [
    { id: 0, name: 'Chill', rarity: 'Common', bytes: seq(ring(C.SKY,6,7,2))},
    { id: 1, name: 'Coin Spark', rarity: 'Uncommon', bytes: seq(circ(C.GOLD,8,14,3), ring(C.SUN,8,14,2), circ(C.GOLD,55,39,2))},
    { id: 2, name: 'Pump Glow', rarity: 'Rare', bytes: seq(rect(C.LIME,4,17,2,10), tri(C.GREEN,4,13,11,13,7,7), rect(C.GREEN,57,38,3,17))},
    { id: 3, name: 'Blue Burst', rarity: 'Epic', bytes: seq(tri(C.SKY,2,21,8,18,6,28), tri(C.BLUE,58,19,62,16,61,27), circ(C.WHITE,7,39,2))},
    { id: 4, name: 'Cronos Aura', rarity: 'Legendary', bytes: seq(ring(C.GOLD,32,31,30), tri(C.SUN,4,7,10,8,7,14), tri(C.SUN,54,7,60,8,57,14))}
  ]},
  { category: 'Legendary', traits: [
    { id: 0, name: 'No Frame', rarity: 'Common', bytes: [] },
    { id: 1, name: 'Diamond Hands', rarity: 'Legendary', bytes: seq(rect(C.GOLD,1,1,62,2), rect(C.GOLD,1,61,62,2), mrect(C.SUN,1,1,2,62))},
    { id: 2, name: 'Moon Mission', rarity: 'Legendary', bytes: seq(rect(C.BLUE,1,1,62,2), rect(C.BLUE,1,61,62,2), ring(C.GOLD,54,10,6))},
    { id: 3, name: 'Genesis Bro', rarity: 'Legendary', bytes: seq(rect(C.SUN,1,1,62,2), rect(C.SUN,1,61,62,2), circ(C.GOLD,8,8,3), circ(C.GOLD,56,56,3))},
    { id: 4, name: 'Cronos Champion', rarity: 'Legendary', bytes: seq(rect(C.CYAN,1,1,62,2), mrect(C.BLUE,1,1,2,62), ring(C.GOLD,32,32,29))},
    { id: 5, name: 'BROCODE 1/1', rarity: '1/1', bytes: seq(rect(C.GOLD,0,0,64,2), rect(C.GOLD,0,62,64,2), mrect(C.GOLD,0,0,2,64), ring(C.SUN,32,32,30))}
  ]}
];

function enforceCompatibility(L) {
  if ((L[10] === 2 || L[10] === 3) && L[9] > 2) L[9] = L[10] === 2 ? 0 : 2;
  if (L[11] > 2 && L[6] > 2) L[6] = 2;
  if (L[11] === 3 && L[7] > 2) L[7] = 0;
  if (L[5] === 4 && L[8] === 1) L[8] = 2;
  if (L[1] < 2 && L[12] > 3) L[12] = 3;
  if (L[3] === 4 && L[4] === 1) L[4] = 0;
  return L;
}

const ONE_OF_ONE_CONFIGS = [
  { title: 'The First Fist Bump',       layers: [7,5,5,5,5,5,5,4,5,5,5,0,5,4,5] },
  { title: 'Candle King',               layers: [6,4,3,4,4,4,4,3,2,0,4,0,4,3,5] },
  { title: 'Moonshot Bro',              layers: [7,3,2,3,3,3,5,4,3,0,3,0,3,4,5] },
  { title: 'Genesis OG',                layers: [4,2,5,4,2,2,3,2,4,2,0,1,1,2,5] },
  { title: 'Diamond Hands',             layers: [5,4,4,5,5,4,2,1,5,0,4,2,4,3,5] },
  { title: 'Cronos Champion',           layers: [6,5,5,4,4,5,2,0,3,4,0,3,5,4,5] },
  { title: 'Golden Bro',                layers: [7,4,4,5,3,5,1,4,0,5,5,0,5,4,5] },
  { title: 'Green Candle Rider',        layers: [3,3,1,2,4,2,3,2,4,3,0,1,2,2,5] },
  { title: 'Bro of the Moon',           layers: [2,2,2,3,3,3,2,0,1,0,2,4,3,1,5] },
  { title: 'The HODLer',                layers: [5,5,3,4,5,4,5,3,2,3,4,0,4,3,5] },
  { title: 'CRO Celebrity',             layers: [6,3,5,3,4,5,4,4,4,4,0,0,5,4,5] },
  { title: 'Bro Code Founder',          layers: [4,4,0,2,2,1,2,0,3,0,3,3,3,2,5] },
  { title: 'Fist Bump Legend',          layers: [7,5,4,5,5,3,5,4,5,0,3,0,3,4,5] },
  { title: 'Blue Cap OG',               layers: [1,3,3,1,3,2,4,2,4,3,1,2,2,1,5] },
  { title: 'Bro Code Royal',            layers: [6,4,5,4,4,4,2,0,5,0,4,4,4,4,5] },
  { title: 'Coin Shades King',          layers: [2,5,2,5,4,5,3,4,3,4,5,0,5,1,5] },
  { title: 'Blue Burst Bro',            layers: [5,2,4,3,5,4,2,3,2,0,2,0,3,3,5] },
  { title: 'Pump Run Champion',         layers: [3,4,1,4,3,1,2,0,4,2,0,3,4,2,5] },
  { title: 'Gold Chain Genesis',        layers: [7,5,5,5,4,5,2,2,1,2,5,4,5,4,5] },
  { title: 'The Brotender',             layers: [4,3,3,2,2,3,3,3,3,3,1,1,1,3,5] },
  { title: 'BROS 2121',                 layers: [6,5,4,5,5,5,2,4,5,5,5,4,5,4,5] }
];

// Short but human-readable on-chain trait names keep the renderer ROM compact.
const SHORT_TRAIT_NAMES = [
  ['Cronos','Fist Bump','Market','Green Up','Red Down','Gold','Moon','Genesis'],
  ['Classic','Street','Gym','Jersey','Moon Suit','Champion'],
  ['Tan','Sunlit','Bronze','Deep','Pale','Blue'],
  ['BRO Tee','Hoodie','Jersey','Green Tee','Moon','Gold Vest'],
  ['Gold Chain','Chain','BRO Coin','Double','Diamond','Cronos'],
  ['Classic','Jaw','Chibi','Beard','Blue','Gold'],
  ['Bright','Focused','Happy','Stars','Coin','Laser'],
  ['Straight','Raised','Bro','Arch','Gold'],
  ['Smile','Smirk','Grin','Tongue','Grill','Laugh'],
  ['Sweep','Spikes','Crop','Blond','Blue','Gold'],
  ['Blue Cap','Snapback','CRO Cap','Moon Hat','Crown','Halo'],
  ['Coin Shades','Shades','Coin Lens','Blue Lens','Gold'],
  ['Fist','Fist Bump','Thumbs','Coin','Diamond','Candle'],
  ['Chill','Coins','Pump','Burst','Aura'],
  ['None','Diamonds','Moonshot','Genesis','Champion','1/1']
];
for (let layer = 0; layer < LAYERS.length; layer++) {
  for (let trait = 0; trait < LAYERS[layer].traits.length; trait++) {
    LAYERS[layer].traits[trait].name = SHORT_TRAIT_NAMES[layer][trait];
  }
}
LAYERS[0].category = 'Background';
LAYERS[1].category = 'Body';
LAYERS[2].category = 'Skin';
LAYERS[3].category = 'Clothing';
LAYERS[4].category = 'Accessory';
LAYERS[5].category = 'Face';
LAYERS[6].category = 'Eyes';
LAYERS[7].category = 'Brows';
LAYERS[8].category = 'Mouth';
LAYERS[9].category = 'Hair';
LAYERS[10].category = 'Headwear';
LAYERS[11].category = 'Eyewear';
LAYERS[12].category = 'Hand';
LAYERS[13].category = 'Special';
LAYERS[14].category = 'Legendary';

// The official mascot signatures stay present in every token: cap, coin shades,
// chain and fist. Higher trait IDs remix those signature elements.
LAYERS[4].traits[0].bytes = seq(spath(C.GOLD,22,39,32,49,42,39));
LAYERS[10].traits[0].bytes = seq(
  quad(C.NAVY,16,12,48,12,45,5,19,5), rect(C.BLUE,17,8,29,7)
);
LAYERS[12].traits[0].bytes = seq(quad(C.P1,5,41,16,38,21,47,17,53));

// Keep the silhouette readable with very few primitives per trait.
// Skin is deliberately symmetric; face/eye/eyewear shapes are redrawn as paired primitives.
for (const t of LAYERS[2].traits) {
  t.bytes = seq(
    rect(C.DARK,27,32,10,13), rect(C.P1,29,33,6,11),
    mrect(C.DARK,7,39,9,15), mrect(C.P1,9,41,7,11)
  );
}
const FACE_SHAPES = [
  seq(quad(C.DARK,16,12,48,12,46,35,32,42,18,35), quad(C.P1,19,14,45,14,43,33,32,39,21,33)),
  seq(quad(C.DARK,15,12,49,12,47,36,32,42,17,36), quad(C.P1,18,14,46,14,44,34,32,39,20,34)),
  seq(quad(C.DARK,18,13,46,13,44,34,32,40,20,34), quad(C.P1,21,15,43,15,42,32,32,37,22,32)),
  seq(quad(C.DARK,16,12,48,12,46,36,32,42,18,36), quad(C.P1,19,14,45,14,43,32,32,37,21,32)),
  seq(quad(C.DARK,16,12,48,12,46,35,32,42,18,35), quad(C.P1,19,14,45,14,43,33,32,39,21,33)),
  seq(quad(C.BRONZE,16,12,48,12,46,35,32,42,18,35), quad(C.GOLD,19,14,45,14,43,33,32,39,21,33))
];
for (let i = 0; i < LAYERS[5].traits.length; i++) LAYERS[5].traits[i].bytes = FACE_SHAPES[i];
const EYE_SHAPES = [
  seq(mrect(C.BLACK,22,23,5,3)), seq(mrect(C.WHITE,22,23,5,3)),
  seq(mrect(C.BROWN,22,23,5,3)), seq(mrect(C.GOLD,22,22,5,4)),
  seq(mrect(C.GOLD,22,22,5,4)), seq(mrect(C.RED,22,23,5,3))
];
for (let i = 0; i < LAYERS[6].traits.length; i++) LAYERS[6].traits[i].bytes = EYE_SHAPES[i];
const BROW_SHAPES = [
  seq(mrect(C.BROWN,22,18,7,2)), seq(mrect(C.BROWN,22,17,7,2)),
  seq(mrect(C.BLACK,22,18,7,2)), seq(mrect(C.BROWN,22,17,7,2)),
  seq(mrect(C.GOLD,22,18,7,2))
];
for (let i = 0; i < LAYERS[7].traits.length; i++) LAYERS[7].traits[i].bytes = BROW_SHAPES[i];
const HAND_SHAPES = [
  seq(quad(C.P1,5,41,16,38,21,47,17,53)),
  seq(quad(C.P1,4,41,17,38,22,48,16,54)),
  seq(quad(C.P1,8,39,14,39,15,48,8,48)),
  seq(quad(C.P1,6,42,17,39,22,50,17,54)),
  seq(quad(C.BLUE,5,42,16,40,21,49,16,54)),
  seq(quad(C.GREEN,5,42,16,40,21,49,16,54))
];
for (let i = 0; i < LAYERS[12].traits.length; i++) LAYERS[12].traits[i].bytes = HAND_SHAPES[i];
const EYEWEAR_SHAPES = [
  seq(mrect(C.BLACK,18,22,11,7), mrect(C.GOLD,21,24,5,4)),
  seq(mrect(C.BLACK,18,22,11,7), mrect(C.SILVER,21,23,5,1)),
  seq(mrect(C.BLACK,18,22,11,7), mrect(C.GOLD,21,24,5,4)),
  seq(mrect(C.BLACK,18,22,11,7), mrect(C.SKY,21,24,5,4)),
  seq(mrect(C.GOLD,17,21,13,8), mrect(C.BLACK,21,24,5,2))
];
for (let i = 0; i < LAYERS[11].traits.length; i++) LAYERS[11].traits[i].bytes = EYEWEAR_SHAPES[i];

function shapeBytes(op) {
  if (op === 0 || op === 1 || op === 7) return 5;
  if (op === 2 || op === 3) return 4;
  if (op === 4 || op === 6) return 7;
  if (op === 5) return 9;
  throw new Error('Unknown shape opcode ' + op);
}
const SHAPE_LIMITS = [2,1,4,1,1,2,1,1,1,1,2,2,1,1,1];
for (let layer = 0; layer < LAYERS.length; layer++) {
  for (const trait of LAYERS[layer].traits) {
    const bytes = trait.bytes;
    const kept = [];
    let at = 0, count = 0;
    while (at < bytes.length && count < SHAPE_LIMITS[layer]) {
      const op = bytes[at] >> 5;
      const n = shapeBytes(op);
      kept.push(...bytes.slice(at, at + n));
      at += n;
      count++;
    }
    trait.bytes = kept;
  }
}

module.exports = { STATIC_COLORS, C, SKIN_PALETTES, rect, rAlph, circ, ring, tri, quad, spath, mrect, seq, LAYERS, enforceCompatibility, ONE_OF_ONE_CONFIGS };
