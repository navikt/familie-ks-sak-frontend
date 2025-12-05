import type { PropsWithChildren } from 'react';

import { describe, expect } from 'vitest';

import { ActionMenu } from '@navikt/ds-react';

import { EndreBehandlingstema } from './EndreBehandlingstema';
import { render } from '../../../../../testutils/testrender';

function Wrapper({ children }: PropsWithChildren) {
    return (
        <ActionMenu open={true}>
            <ActionMenu.Content>{children}</ActionMenu.Content>
        </ActionMenu>
    );
}

describe('EndreBehandlingstema', () => {
    test('skal rendre komponent', () => {
        const åpneModal = vi.fn();
        const { screen } = render(<EndreBehandlingstema åpneModal={åpneModal} />, { wrapper: Wrapper });
        expect(screen.getByRole('menuitem', { name: 'Endre behandlingstema' })).toBeInTheDocument();
    });

    test('skal kunne åpne modal', async () => {
        const åpneModal = vi.fn();
        const { screen, user } = render(<EndreBehandlingstema åpneModal={åpneModal} />, { wrapper: Wrapper });
        const knapp = screen.getByRole('menuitem', { name: 'Endre behandlingstema' });
        await user.click(knapp);
        expect(åpneModal).toHaveBeenCalledOnce();
    });
});
