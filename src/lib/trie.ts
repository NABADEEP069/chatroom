class TrieNode {
  children: Record<string, TrieNode>;
  isEnd: boolean;

  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

export default class Trie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string) {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  censor(text: string): string {
    const lower = text.toLowerCase();
    const out = text.split('');
    for (let i = 0; i < lower.length; i++) {
      let node = this.root;
      const indices: number[] = [];
      for (let j = i; j < lower.length; j++) {
        const ch = lower[j];
        if (!node.children[ch]) break;
        node = node.children[ch];
        indices.push(j);
        if (node.isEnd) {
          for (const k of indices) out[k] = '*';
        }
      }
    }
    return out.join('');
  }
}
