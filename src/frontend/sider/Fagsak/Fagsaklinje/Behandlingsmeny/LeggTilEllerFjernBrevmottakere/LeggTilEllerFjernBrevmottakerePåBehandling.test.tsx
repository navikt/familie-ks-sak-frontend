import type { PropsWithChildren } from 'react';

import { describe, expect } from 'vitest';

import { ActionMenu } from '@navikt/ds-react';

import { LeggTilEllerFjernBrevmottakerePåBehandling } from './LeggTilEllerFjernBrevmottakerePåBehandling';
import { lagBehandling } from '../../../../../testutils/testdata/behandlingTestdata';
import { lagRestBrevmottaker } from '../../../../../testutils/testdata/brevmottakerTestdata';
import { lagFagsak } from '../../../../../testutils/testdata/fagsakTestdata';
import { render, TestProviders } from '../../../../../testutils/testrender';
import { type IBehandling } from '../../../../../typer/behandling';
import { type IMinimalFagsak } from '../../../../../typer/fagsak';
import { BehandlingProvider } from '../../../Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '../../../Behandling/context/HentOgSettBehandlingContext';
import { FagsakProvider } from '../../../FagsakContext';

interface WrapperProps extends PropsWithChildren {
    fagsak?: IMinimalFagsak;
    behandling?: IBehandling;
}

function Wrapper({ fagsak = lagFagsak(), behandling = lagBehandling(), children }: WrapperProps) {
    return (
        <TestProviders>
            <FagsakProvider fagsak={fagsak}>
                <HentOgSettBehandlingProvider fagsak={fagsak}>
                    <BehandlingProvider behandling={behandling}>
                        <ActionMenu open={true}>
                            <ActionMenu.Content>{children}</ActionMenu.Content>
                        </ActionMenu>
                    </BehandlingProvider>
                </HentOgSettBehandlingProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

describe('LeggTilEllerFjernBrevmottakerePåBehandling', () => {
    test('skal rendre komponent', () => {
        const åpneModal = vi.fn();
        const { screen } = render(<LeggTilEllerFjernBrevmottakerePåBehandling åpneModal={åpneModal} />, {
            wrapper: Wrapper,
        });
        expect(screen.getByRole('menuitem', { name: 'Legg til brevmottaker' })).toBeInTheDocument();
    });

    test('skal rendre komponent med en brevmottaker allerede lagt til', () => {
        const åpneModal = vi.fn();
        const { screen } = render(<LeggTilEllerFjernBrevmottakerePåBehandling åpneModal={åpneModal} />, {
            wrapper: props => (
                <Wrapper {...props} behandling={lagBehandling({ brevmottakere: [lagRestBrevmottaker()] })} />
            ),
        });
        expect(screen.getByRole('menuitem', { name: 'Legg til eller fjern brevmottaker' })).toBeInTheDocument();
    });

    test('skal rendre komponent med flere brevmottakere allerede lagt til', () => {
        const åpneModal = vi.fn();
        const { screen } = render(<LeggTilEllerFjernBrevmottakerePåBehandling åpneModal={åpneModal} />, {
            wrapper: props => (
                <Wrapper
                    {...props}
                    behandling={lagBehandling({ brevmottakere: [lagRestBrevmottaker(), lagRestBrevmottaker()] })}
                />
            ),
        });
        expect(screen.getByRole('menuitem', { name: 'Se eller fjern brevmottakere' })).toBeInTheDocument();
    });

    test('skal kunne åpne modal', async () => {
        const åpneModal = vi.fn();
        const { screen, user } = render(<LeggTilEllerFjernBrevmottakerePåBehandling åpneModal={åpneModal} />, {
            wrapper: Wrapper,
        });
        const knapp = screen.getByRole('menuitem', { name: 'Legg til brevmottaker' });
        await user.click(knapp);
        expect(åpneModal).toHaveBeenCalledOnce();
    });
});
