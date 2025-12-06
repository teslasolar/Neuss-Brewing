// 🔤 Tokenizer - BPE/WordPiece Token Encoding
// Compatible with HuggingFace tokenizers

export class Tokenizer {
  constructor(config) {
    this.vocab = new Map(Object.entries(config.vocab || {}));
    this.reverseVocab = new Map();
    for (const [token, id] of this.vocab) {
      this.reverseVocab.set(id, token);
    }

    this.merges = config.merges || [];
    this.specialTokens = config.special_tokens || {};
    this.padId = this.specialTokens.pad || 0;
    this.bosId = this.specialTokens.bos || 1;
    this.eosId = this.specialTokens.eos || 2;
    this.unkId = this.specialTokens.unk || 3;

    // BPE merge rules
    this.bpeRanks = new Map();
    this.merges.forEach((merge, i) => {
      this.bpeRanks.set(merge, i);
    });

    // Regex pattern for tokenization
    this.pattern = config.pattern || /\s?[\w]+|[^\s\w]+/g;
  }

  static async fromUrl(url) {
    const config = await fetch(url).then(r => r.json());
    return new Tokenizer(config);
  }

  static async fromJson(json) {
    return new Tokenizer(json);
  }

  // Encode text to token IDs
  encode(text, options = {}) {
    const { addBos = false, addEos = false } = options;
    const tokens = [];

    if (addBos) tokens.push(this.bosId);

    // Split into words
    const words = text.match(this.pattern) || [];

    for (const word of words) {
      // Convert to BPE tokens
      const bpeTokens = this.bpe(word);
      for (const token of bpeTokens) {
        const id = this.vocab.get(token);
        tokens.push(id !== undefined ? id : this.unkId);
      }
    }

    if (addEos) tokens.push(this.eosId);

    return tokens;
  }

  // Decode token IDs to text
  decode(ids, options = {}) {
    const { skipSpecial = true } = options;
    const tokens = [];

    for (const id of ids) {
      if (skipSpecial && this.isSpecialToken(id)) continue;

      const token = this.reverseVocab.get(id);
      if (token) {
        tokens.push(token);
      }
    }

    // Join and clean up BPE artifacts
    let text = tokens.join('');
    text = text.replace(/Ġ/g, ' '); // GPT-2 style space marker
    text = text.replace(/▁/g, ' '); // SentencePiece style
    text = text.replace(/##/g, ''); // WordPiece style

    return text.trim();
  }

  // BPE encoding
  bpe(word) {
    if (word.length <= 1) {
      return [word];
    }

    // Convert to character pairs
    let pairs = this.getPairs(word.split(''));

    while (true) {
      // Find lowest ranked pair
      let minRank = Infinity;
      let minPair = null;

      for (const pair of pairs) {
        const pairStr = pair.join(' ');
        const rank = this.bpeRanks.get(pairStr);
        if (rank !== undefined && rank < minRank) {
          minRank = rank;
          minPair = pair;
        }
      }

      if (!minPair) break;

      // Merge the pair
      word = this.mergePair(word.split(''), minPair).join('');
      if (word.length <= 1) break;

      pairs = this.getPairs(word.split(''));
    }

    return word.split(' ');
  }

  // Get adjacent pairs from word
  getPairs(word) {
    const pairs = new Set();
    for (let i = 0; i < word.length - 1; i++) {
      pairs.add([word[i], word[i + 1]]);
    }
    return pairs;
  }

  // Merge a pair in the word
  mergePair(word, pair) {
    const result = [];
    let i = 0;

    while (i < word.length) {
      if (i < word.length - 1 && word[i] === pair[0] && word[i + 1] === pair[1]) {
        result.push(pair[0] + pair[1]);
        i += 2;
      } else {
        result.push(word[i]);
        i++;
      }
    }

    return result;
  }

  // Check if token is special
  isSpecialToken(id) {
    return id === this.padId || id === this.bosId ||
           id === this.eosId || id === this.unkId;
  }

  // Get vocab size
  get vocabSize() {
    return this.vocab.size;
  }

  // Token to ID
  tokenToId(token) {
    return this.vocab.get(token);
  }

  // ID to token
  idToToken(id) {
    return this.reverseVocab.get(id);
  }
}

// 🎲 Simple character-level tokenizer for FemtoLLM
export class CharTokenizer {
  constructor() {
    this.chars = '\n !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    this.vocab = new Map();
    this.reverseVocab = new Map();

    for (let i = 0; i < this.chars.length; i++) {
      this.vocab.set(this.chars[i], i);
      this.reverseVocab.set(i, this.chars[i]);
    }

    this.unkId = this.chars.length;
    this.eosId = this.chars.length + 1;
    this.bosId = this.chars.length + 2;
  }

  encode(text) {
    return Array.from(text).map(c => this.vocab.get(c) ?? this.unkId);
  }

  decode(ids) {
    return ids.map(id => this.reverseVocab.get(id) ?? '').join('');
  }

  get vocabSize() {
    return this.chars.length + 3;
  }
}

export default Tokenizer;
