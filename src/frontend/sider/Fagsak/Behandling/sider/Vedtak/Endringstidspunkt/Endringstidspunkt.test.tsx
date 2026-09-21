import type { PropsWithChildren } from 'react';

import { EndringstidspunktDialogProvider } from '@sider/Fagsak/Behandling/sider/Vedtak/Endringstidspunkt/EndringstidspunktDialogContext';
import { render } from '@testutils/testrender';
import { describe, expect, test } from 'vitest';

import { ActionMenu } from '@navikt/ds-react';

import { Endringstidspunkt } from './Endringstidspunkt';

function Wrapper({ children }: PropsWithChildren) {
    return (
        <EndringstidspunktDialogProvider>
            {({ erDialogÅpen }) => (
                <>
                    <ActionMenu open={true}>
                        <ActionMenu.Content>{children}</ActionMenu.Content>
                    </ActionMenu>
                    <span>{erDialogÅpen ? 'Dialog er åpen' : 'Dialog er lukket'}</span>
                </>
            )}
        </EndringstidspunktDialogProvider>
    );
}

describe('Endringstidspunkt', () => {
    test('skal rendre komponent', () => {
        // Act
        const { screen } = render(<Endringstidspunkt />, { wrapper: Wrapper });

        // Assert
        expect(screen.getByRole('menuitem', { name: 'Oppdater endringstidspunkt' })).toBeInTheDocument();
        expect(screen.getByText('Dialog er lukket')).toBeInTheDocument();
    });

    test('skal åpne dialog når man klikker på menyvalget', async () => {
        // Arrange
        const { screen, user } = render(<Endringstidspunkt />, { wrapper: Wrapper });

        // Act
        await user.click(screen.getByRole('menuitem', { name: 'Oppdater endringstidspunkt' }));

        // Assert
        expect(screen.getByText('Dialog er åpen')).toBeInTheDocument();
    });
});
