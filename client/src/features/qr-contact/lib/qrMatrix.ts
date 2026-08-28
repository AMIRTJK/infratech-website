/**
 * Генератор матрицы QR-кода на базе алгоритма Kazuhiko Arase.
 * Поддерживает byte-mode кодирование с автоматическим выбором версии (уровень M).
 */

interface IBitBuffer {
  buffer: number[];
  length: number;
}

const createBitBuffer = (): IBitBuffer => ({
  buffer: [],
  length: 0,
});

const putBit = (buf: IBitBuffer, bit: boolean): void => {
  const bufIndex = Math.floor(buf.length / 8);
  if (buf.buffer.length <= bufIndex) buf.buffer.push(0);
  if (bit) {
    const currentVal = buf.buffer[bufIndex] ?? 0;
    buf.buffer[bufIndex] = currentVal | (0x80 >>> (buf.length % 8));
  }
  buf.length++;
};

const putBits = (buf: IBitBuffer, num: number, length: number): void => {
  for (let i = 0; i < length; i++) {
    putBit(buf, ((num >>> (length - i - 1)) & 1) === 1);
  }
};

const EXP_TABLE: number[] = new Array(256);
const LOG_TABLE: number[] = new Array(256);

for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) {
  EXP_TABLE[i] =
    (EXP_TABLE[i - 4] ?? 0) ^
    (EXP_TABLE[i - 5] ?? 0) ^
    (EXP_TABLE[i - 6] ?? 0) ^
    (EXP_TABLE[i - 8] ?? 0);
}
for (let i = 0; i < 255; i++) {
  const expVal = EXP_TABLE[i];
  if (expVal !== undefined) {
    LOG_TABLE[expVal] = i;
  }
}

const gexp = (n: number): number => {
  let x = n;
  while (x < 0) x += 255;
  while (x >= 255) x -= 255;
  return EXP_TABLE[x] ?? 0;
};

const glog = (n: number): number => {
  return LOG_TABLE[n] ?? 0;
};

class Polynomial {
  num: number[];

  constructor(num: number[], shift = 0) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset] ?? 0;
    }
    for (let i = num.length - offset; i < this.num.length; i++) {
      this.num[i] = 0;
    }
  }

  get(index: number): number {
    return this.num[index] ?? 0;
  }

  getLength(): number {
    return this.num.length;
  }

  multiply(e: Polynomial): Polynomial {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
      }
    }
    return new Polynomial(num);
  }

  mod(e: Polynomial): Polynomial {
    if (this.getLength() - e.getLength() < 0) return this;
    const ratio = glog(this.get(0)) - glog(e.get(0));
    const num = this.num.slice();
    for (let i = 0; i < e.getLength(); i++) {
      num[i] = (num[i] ?? 0) ^ gexp(glog(e.get(i)) + ratio);
    }
    return new Polynomial(num).mod(e);
  }
}

const getErrorCorrectPolynomial = (errorCorrectLength: number): Polynomial => {
  let a = new Polynomial([1]);
  for (let i = 0; i < errorCorrectLength; i++) {
    a = a.multiply(new Polynomial([1, gexp(i)]));
  }
  return a;
};

const RS_BLOCK_TABLE_M: readonly number[][] = [
  [1, 26, 16],
  [1, 44, 28],
  [1, 70, 44],
  [2, 50, 32],
  [2, 64, 42],
  [4, 43, 27],
  [4, 49, 31],
  [2, 60, 38, 2, 61, 39],
  [3, 58, 36, 2, 59, 37],
  [4, 69, 43, 1, 70, 44],
  [1, 80, 50, 4, 81, 51],
  [6, 58, 36, 2, 59, 37],
  [8, 59, 37, 1, 60, 38],
  [4, 64, 40, 5, 65, 41],
  [5, 65, 41, 5, 66, 42],
  [7, 73, 45, 3, 74, 46],
  [10, 74, 46, 1, 75, 47],
  [9, 69, 43, 4, 70, 44],
  [3, 70, 44, 11, 71, 45],
  [3, 67, 41, 13, 68, 42],
] as const;

const CAPACITY_M: readonly number[] = [
  14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450,
  504, 560, 624, 666,
] as const;

interface IRSBlockInfo {
  totalCount: number;
  dataCount: number;
}

const getRSBlocks = (version: number): IRSBlockInfo[] => {
  const row = RS_BLOCK_TABLE_M[version - 1] ?? [];
  const list: IRSBlockInfo[] = [];
  for (let i = 0; i < row.length; i += 3) {
    const count = row[i] ?? 0;
    const totalCount = row[i + 1] ?? 0;
    const dataCount = row[i + 2] ?? 0;
    for (let j = 0; j < count; j++) {
      list.push({ totalCount, dataCount });
    }
  }
  return list;
};

const createBytes = (
  buffer: IBitBuffer,
  rsBlocks: IRSBlockInfo[]
): number[] => {
  let offset = 0;
  let maxDcCount = 0;
  let maxEcCount = 0;

  const dcdata: number[][] = new Array(rsBlocks.length);
  const ecdata: number[][] = new Array(rsBlocks.length);

  for (let r = 0; r < rsBlocks.length; r++) {
    const block = rsBlocks[r];
    if (!block) continue;
    const dcCount = block.dataCount;
    const ecCount = block.totalCount - dcCount;

    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    dcdata[r] = new Array(dcCount);
    for (let i = 0; i < dcCount; i++) {
      const byteVal = buffer.buffer[i + offset] ?? 0;
      dcdata[r]![i] = 0xff & byteVal;
    }
    offset += dcCount;

    const rsPoly = getErrorCorrectPolynomial(ecCount);
    const rawPoly = new Polynomial(dcdata[r]!, rsPoly.getLength() - 1);
    const modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.getLength() - 1);
    for (let i = 0; i < ecdata[r]!.length; i++) {
      const modIndex = i + modPoly.getLength() - ecdata[r]!.length;
      ecdata[r]![i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
    }
  }

  const totalCodeCount = rsBlocks.reduce((sum, b) => sum + b.totalCount, 0);
  const data = new Array(totalCodeCount);
  let index = 0;

  for (let i = 0; i < maxDcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      const dcArr = dcdata[r];
      if (dcArr && i < dcArr.length) {
        data[index++] = dcArr[i];
      }
    }
  }
  for (let i = 0; i < maxEcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      const ecArr = ecdata[r];
      if (ecArr && i < ecArr.length) {
        data[index++] = ecArr[i];
      }
    }
  }

  return data;
};

const createData = (version: number, data: Uint8Array): number[] => {
  const buffer = createBitBuffer();
  putBits(buffer, 4, 4);
  const lengthBits = version <= 9 ? 8 : 16;
  putBits(buffer, data.length, lengthBits);
  for (let i = 0; i < data.length; i++) {
    const val = data[i];
    if (val !== undefined) putBits(buffer, val, 8);
  }

  const rsBlocks = getRSBlocks(version);
  const totalDataCount = rsBlocks.reduce((sum, b) => sum + b.dataCount, 0);

  if (buffer.length + 4 <= totalDataCount * 8) putBits(buffer, 0, 4);
  while (buffer.length % 8 !== 0) putBit(buffer, false);

  while (true) {
    if (buffer.length >= totalDataCount * 8) break;
    putBits(buffer, 0xec, 8);
    if (buffer.length >= totalDataCount * 8) break;
    putBits(buffer, 0x11, 8);
  }

  return createBytes(buffer, rsBlocks);
};

const PATTERN_POSITION_TABLE: readonly number[][] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
] as const;

const getBCHDigit = (data: number): number => {
  let digit = 0;
  let d = data;
  while (d !== 0) {
    digit++;
    d >>>= 1;
  }
  return digit;
};

const getBCHTypeInfo = (data: number): number => {
  const G15 =
    (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
  const G15_MASK =
    (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
  }
  return ((data << 10) | d) ^ G15_MASK;
};

const getMaskFunction = (
  pattern: number
): ((row: number, col: number) => boolean) => {
  switch (pattern) {
    case 0:
      return (r, c) => (r + c) % 2 === 0;
    case 1:
      return (r) => r % 2 === 0;
    case 2:
      return (_r, c) => c % 3 === 0;
    case 3:
      return (r, c) => (r + c) % 3 === 0;
    case 4:
      return (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5:
      return (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6:
      return (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    case 7:
      return (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    default:
      return () => false;
  }
};

class QRModel {
  moduleCount: number;
  modules: (boolean | null)[][];
  version: number;

  constructor(version: number) {
    this.version = version;
    this.moduleCount = version * 4 + 17;
    this.modules = [];
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules.push(new Array(this.moduleCount).fill(null));
    }
  }

  setupPositionProbePattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        const isBorder =
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        const rowArr = this.modules[row + r];
        if (rowArr) rowArr[col + c] = isBorder;
      }
    }
  }

  setupPositionAdjustPattern(): void {
    const pos = PATTERN_POSITION_TABLE[this.version - 1] ?? [];
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i] ?? 0;
        const col = pos[j] ?? 0;
        const rowArr = this.modules[row];
        if (rowArr && rowArr[col] !== null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const isEdge =
              r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
            const targetRow = this.modules[row + r];
            if (targetRow) targetRow[col + c] = isEdge;
          }
        }
      }
    }
  }

  setupTimingPattern(): void {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      const rowArr = this.modules[r];
      if (rowArr && rowArr[6] === null) {
        rowArr[6] = r % 2 === 0;
      }
    }
    const centerRow = this.modules[6];
    if (centerRow) {
      for (let c = 8; c < this.moduleCount - 8; c++) {
        if (centerRow[c] === null) {
          centerRow[c] = c % 2 === 0;
        }
      }
    }
  }

  setupTypeInfo(maskPattern: number): void {
    const ecLevelBits = 0;
    const data = (ecLevelBits << 3) | maskPattern;
    const bits = getBCHTypeInfo(data);

    for (let i = 0; i < 15; i++) {
      const mod = ((bits >> i) & 1) === 1;
      if (i < 6) {
        const row = this.modules[i];
        if (row) row[8] = mod;
      } else if (i < 8) {
        const row = this.modules[i + 1];
        if (row) row[8] = mod;
      } else {
        const row = this.modules[this.moduleCount - 15 + i];
        if (row) row[8] = mod;
      }
    }

    const row8 = this.modules[8];
    if (row8) {
      for (let i = 0; i < 15; i++) {
        const mod = ((bits >> i) & 1) === 1;
        if (i < 8) {
          row8[this.moduleCount - i - 1] = mod;
        } else if (i < 9) {
          row8[15 - i - 1 + 1] = mod;
        } else {
          row8[15 - i - 1] = mod;
        }
      }
      row8[8] = false;
    }

    const targetRow = this.modules[this.moduleCount - 8];
    if (targetRow) targetRow[8] = false;
  }

  mapData(data: number[], maskPattern: number): void {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    const maskFunc = getMaskFunction(maskPattern);

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      while (true) {
        for (let c = 0; c < 2; c++) {
          const currentCol = col - c;
          const rowArr = this.modules[row];
          if (rowArr && rowArr[currentCol] === null) {
            let dark = false;
            if (byteIndex < data.length) {
              const dataByte = data[byteIndex] ?? 0;
              dark = ((dataByte >>> bitIndex) & 1) === 1;
            }
            const mask = maskFunc(row, currentCol);
            if (mask) dark = !dark;
            rowArr[currentCol] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  build(data: number[], maskPattern: number): void {
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(maskPattern);
    this.mapData(data, maskPattern);
  }
}

const pickVersion = (byteLength: number): number => {
  for (let v = 1; v <= 20; v++) {
    const cap = CAPACITY_M[v - 1] ?? 0;
    if (byteLength <= cap) return v;
  }
  return 20;
};

const countDarkModules = (model: QRModel): number => {
  let count = 0;
  for (let r = 0; r < model.moduleCount; r++) {
    const rowArr = model.modules[r];
    if (!rowArr) continue;
    for (let c = 0; c < model.moduleCount; c++) {
      if (rowArr[c]) count++;
    }
  }
  return count;
};

export const generateQrMatrix = (text: string): boolean[][] => {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = pickVersion(bytes.length);
  const data = createData(version, new Uint8Array(bytes));

  let bestModel: QRModel | null = null;
  let bestScore = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const model = new QRModel(version);
    model.build(data, mask);
    const score = countDarkModules(model);
    if (score < bestScore) {
      bestScore = score;
      bestModel = model;
    }
  }

  const finalModel = bestModel ?? new QRModel(version);
  const result: boolean[][] = [];
  for (let r = 0; r < finalModel.moduleCount; r++) {
    const rowArr = finalModel.modules[r] ?? [];
    result.push(rowArr.map((m) => !!m));
  }
  return result;
};
