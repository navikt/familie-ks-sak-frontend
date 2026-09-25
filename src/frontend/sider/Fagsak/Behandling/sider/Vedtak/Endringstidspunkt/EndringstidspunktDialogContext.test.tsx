import type { PropsWithChildren } from 'react';

import { act, renderHook } from '@testing-library/react';
import { render } from '@testutils/testrender';
import { describe, expect, test, vi } from 'vitest';

import { EndringstidspunktDialogProvider, useEndringstidspunktDialogContext } from './EndringstidspunktDialogContext';

function wrapper({ children }: PropsWithChildren) {
    return <EndringstidspunktDialogProvider>{children}</EndringstidspunktDialogProvider>;
}

describe('EndringstidspunktDialogContext', () => {
    test('kaster feil når useEndringstidspunktDialogContext brukes utenfor EndringstidspunktDialogProvider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => renderHook(() => useEndringstidspunktDialogContext())).toThrow(
            'useEndringstidspunktDialogContext må brukes innenfor en EndringstidspunktDialogProvider.'
        );

        consoleError.mockRestore();
    });

    test('erDialogÅpen er false ved oppstart', () => {
        const { result } = renderHook(() => useEndringstidspunktDialogContext(), { wrapper });

        expect(result.current.erDialogÅpen).toBe(false);
    });

    test('erDialogÅpen kan settes til true ved oppstart', () => {
        const { result } = renderHook(() => useEndringstidspunktDialogContext(), {
            wrapper: ({ children }) => (
                <EndringstidspunktDialogProvider initialErÅpen>{children}</EndringstidspunktDialogProvider>
            ),
        });

        expect(result.current.erDialogÅpen).toBe(true);
    });

    test('åpneDialog setter erDialogÅpen til true', () => {
        const { result } = renderHook(() => useEndringstidspunktDialogContext(), { wrapper });

        act(() => result.current.åpneDialog());

        expect(result.current.erDialogÅpen).toBe(true);
    });

    test('lukkDialog setter erDialogÅpen til false igjen', () => {
        const { result } = renderHook(() => useEndringstidspunktDialogContext(), { wrapper });

        act(() => result.current.åpneDialog());
        act(() => result.current.lukkDialog());

        expect(result.current.erDialogÅpen).toBe(false);
    });

    test('children kan settes opp som en vanlig React-node', () => {
        const { screen } = render(
            <EndringstidspunktDialogProvider>
                <span>Innhold</span>
            </EndringstidspunktDialogProvider>
        );

        expect(screen.getByText('Innhold')).toBeInTheDocument();
    });

    test('children kan settes opp som en render-prop-funksjon med tilgang til konteksten', async () => {
        const { screen, user } = render(
            <EndringstidspunktDialogProvider>
                {({ erDialogÅpen, åpneDialog }) => (
                    <>
                        <span>{erDialogÅpen ? 'Åpen' : 'Lukket'}</span>
                        <button onClick={åpneDialog}>Åpne</button>
                    </>
                )}
            </EndringstidspunktDialogProvider>
        );

        expect(screen.getByText('Lukket')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Åpne' }));

        expect(screen.getByText('Åpen')).toBeInTheDocument();
    });
});
