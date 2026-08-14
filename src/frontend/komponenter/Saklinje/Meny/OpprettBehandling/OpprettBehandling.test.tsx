import { type PropsWithChildren } from 'react';

import { expect } from 'vitest';

import { ActionMenu } from '@navikt/ds-react';

import { OpprettBehandling } from './OpprettBehandling';
import { FagsakProvider } from '../../../../sider/Fagsak/FagsakContext';
import { lagFagsak } from '../../../../testutils/testdata/fagsakTestdata';
import { render } from '../../../../testutils/testrender';
import type { IMinimalFagsak } from '../../../../typer/fagsak';
import { FagsakStatus } from '../../../../typer/fagsak';

interface WrapperProps extends PropsWithChildren {
    fagsak?: IMinimalFagsak;
}

function Wrapper({ fagsak = lagFagsak(), children }: WrapperProps) {
    return (
        <FagsakProvider fagsak={fagsak}>
            <ActionMenu open={true}>
                <ActionMenu.Content>{children}</ActionMenu.Content>
            </ActionMenu>
        </FagsakProvider>
    );
}

describe('OpprettBehandling', () => {
    test('skal rendre komponent som forventet', () => {
        const åpneModal = vi.fn();

        const { screen } = render(<OpprettBehandling åpneModal={åpneModal} />, { wrapper: Wrapper });

        expect(screen.getByRole('menuitem', { name: 'Opprett behandling' })).toBeInTheDocument();
    });

    test('skal kunne klikke på opprett behandling', async () => {
        const åpneModal = vi.fn();

        const { screen, user } = render(<OpprettBehandling åpneModal={åpneModal} />, { wrapper: Wrapper });

        const knapp = screen.getByRole('menuitem', { name: 'Opprett behandling' });
        await user.click(knapp);

        expect(åpneModal).toHaveBeenCalledOnce();
    });

    test('skal ikke rendre komponenten når fagsaken er låst', () => {
        const åpneModal = vi.fn();

        const { screen } = render(<OpprettBehandling åpneModal={åpneModal} />, {
            wrapper: props => <Wrapper {...props} fagsak={lagFagsak({ status: FagsakStatus.LÅST })} />,
        });

        expect(screen.queryByRole('menuitem', { name: 'Opprett behandling' })).not.toBeInTheDocument();
    });
});
