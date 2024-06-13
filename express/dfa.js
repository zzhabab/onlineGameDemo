class DFAUtil {
  constructor() {
    this.dfaMap = {};
    this.minMatchType = 1;
    this.maxMatchType = 2;
  }

  createDFAHashMap(set) {
    for (const key of set) {
      // 无论是js还是java中，这句的浅拷贝都十分关键
      let nowMap = this.dfaMap
      for (let i = 0; i < key.length; i++) {
        const nowChar = key.charAt(i);
        // 这里的nowMap能改成this.dfaMap吗，一定不能
        if (!nowMap[nowChar]) {
          nowMap[nowChar] = {};
        }
        nowMap = nowMap[nowChar];
        if (nowMap.isEnd === '1') {
          continue;
        }
        if (i !== key.length - 1) {
          nowMap.isEnd = '0';
        } else {
          nowMap.isEnd = '1';
        }
      }
    }
    console.log(this.dfaMap);
  }

  getSensitiveWordByDFAMap(string, matchType) {
    const set = new Set();
    for (let i = 0; i < string.length; i++) {
      const length = this.getSensitiveLengthByDFAMap(string, i, matchType);
      if (length > 0) {
        set.add(string.substring(i, i + length));
      }
    }
    return set;
  }

  getSensitiveLengthByDFAMap(string, beginIndex, matchType) {
    let nowLength = 0;
    let resultLength = 0;
    let nowMap = this.dfaMap;
    for (let i = beginIndex; i < string.length; i++) {
      const nowChar = string.charAt(i);
      nowMap = nowMap[nowChar];
      if (!nowMap) {
        break;
      } else {
        nowLength++;
        if (nowMap.isEnd === '1') {
          resultLength = nowLength;
          if (matchType === this.minMatchType) {
            break;
          }
        }
      }
    }
    return resultLength;
  }
}
module.exports = DFAUtil;