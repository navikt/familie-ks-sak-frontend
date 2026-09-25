import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useDialog } from './useDialog';

describe('useDialog', () => {
    test('skal ha åpen som false ved oppstart hvis annet ikke er spesifisert', () => {
        const { result } = renderHook(() => useDialog());

        expect(result.current.åpen).toBe(false);
    });

    test('skal kunne sette initial state til true', () => {
        const { result } = renderHook(() => useDialog(true));

        expect(result.current.åpen).toBe(true);
    });

    test('åpne skal sette åpen til true', () => {
        const { result } = renderHook(() => useDialog());

        act(() => result.current.åpne());

        expect(result.current.åpen).toBe(true);
    });

    test('lukk skal sette åpen til false igjen', () => {
        const { result } = renderHook(() => useDialog(true));

        act(() => result.current.lukk());

        expect(result.current.åpen).toBe(false);
    });
});
