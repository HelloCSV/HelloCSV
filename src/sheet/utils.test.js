import { calculateStringWidth } from './utils.ts';
import { describe, it, expect } from 'vitest';

describe('calculateStringWidth', () => {
    it('ascii only', () => {
        expect(calculateStringWidth("test 1234")).toEqual(9 * 7);
    });

    it('chinese', () => {
        expect(calculateStringWidth("你好!")).toEqual(3 * 7 + 2 * 7);
    });

    it('japanese', () => {
        expect(calculateStringWidth("こんにちは!")).toEqual(6 * 7 + 5 * 7);
    });
    it('korean', () => {
        expect(calculateStringWidth("ㄱㅏ가 힣")).toEqual(5 * 7 + 4 * 7);
    });

    it('undefined value', () => {
        expect(calculateStringWidth(undefined)).toEqual(0);
    });

    it('mixed characters', () => {
        expect(calculateStringWidth("Hello 世界!")).toEqual(9 * 7 + 2 * 7);
    });

    it('empty string', () => {
        expect(calculateStringWidth("")).toEqual(0);
    });

    it('special characters', () => {
        expect(calculateStringWidth("!@#$%^&*()")).toEqual(10 * 7);
    });
});