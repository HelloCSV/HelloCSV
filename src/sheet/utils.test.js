import { calculateStringWidth, calculateColumnWidth } from './utils.ts';
import { describe, it, expect } from 'vitest';

describe('calculateStringWidth', () => {
    it('ascii only', () => {
        expect(calculateStringWidth("test 1234")).toEqual(9 * 8);
    });

    it('chinese', () => {
        expect(calculateStringWidth("你好!")).toEqual(3 * 8 + 2 * 8);
    });

    it('japanese', () => {
        expect(calculateStringWidth("こんにちは!")).toEqual(6 * 8 + 5 * 8);
    });
    it('korean', () => {
        expect(calculateStringWidth("ㄱㅏ가 힣")).toEqual(5 * 8 + 4 * 8);
    });

    it('undefined value', () => {
        expect(calculateStringWidth(undefined)).toEqual(0);
    });

    it('mixed characters', () => {
        expect(calculateStringWidth("Hello 世界!")).toEqual(9 * 8 + 2 * 8);
    });

    it('empty string', () => {
        expect(calculateStringWidth("")).toEqual(0);
    });

    it('special characters', () => {
        expect(calculateStringWidth("!@#$%^&*()")).toEqual(10 * 8);
    });
});

describe('calculateColumnWidth', () => {
    it('header label only', () => {
        expect(calculateColumnWidth({
            id: 'name',
            label: 'Name',
            type: 'string',
        }, [], {})).toEqual(84);
    });

    it('cjk header label', () => {
        expect(calculateColumnWidth({
            id: 'name',
            label: '이름', // 2 * 2
            type: 'string',
        }, [
            "abc" // 3
        ], {})).toEqual(84);
    });

    it('header label and longer row', () => {
        expect(calculateColumnWidth({
            id: 'name',
            label: 'Name',
            type: 'string',
        }, [{ name: 'Very long name' }], {})).toEqual(144);
    });

    it('with readonly column', () => {
        expect(calculateColumnWidth({
            id: 'name',
            label: 'Name',
            type: 'string',
            isReadOnly: true,
        }, [], {})).toEqual(100);
    });

    it('with enum column', () => {
        expect(calculateColumnWidth({
            id: 'name',
            label: 'Name',
            type: 'enum',
            typeArguments: {
                values: [
                    { label: 'Value 1', value: '1' },
                    { label: 'very long label 2', value: '2' },
                    { label: 'Value 3', value: '3' }

                ]
            }
        }, [], {})).toEqual(168);
    })

    it('with reference column', () => {
        expect(calculateColumnWidth({
            id: 'name',
            label: 'Name',
            type: 'reference',
            typeArguments: {
                sheetId: 'employee',
                sheetColumnId: 'email',
            }
        }, [], {
            employee: {
                email: {
                    '1': 'Value 1',
                    '2': 'very long label 2',
                    '3': 'Value 3'
                }
            }
        })).toEqual(168);
    })


});