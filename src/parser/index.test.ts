import { describe, it, expect } from 'vitest';
import { parseDelimitedText } from './';

describe('parseDelimitedText', () => {
  it('splits tabs and newlines into a 2D array', () => {
    expect(parseDelimitedText('a\tb\nc\td', '\t')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('handles CRLF line endings', () => {
    expect(parseDelimitedText('a\tb\r\nc\td', '\t')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('honors quoted cells containing the delimiter, newlines and quotes', () => {
    expect(parseDelimitedText('"a\tb"\t"c\nd"\t"say ""hi"""', '\t')).toEqual([
      ['a\tb', 'c\nd', 'say "hi"'],
    ]);
  });

  it('parses comma-delimited text too', () => {
    expect(parseDelimitedText('a,b\nc,d', ',')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('returns an empty array for empty text', () => {
    expect(parseDelimitedText('', '\t')).toEqual([]);
  });
});
