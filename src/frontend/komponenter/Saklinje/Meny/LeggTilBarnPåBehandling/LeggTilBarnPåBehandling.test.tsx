import type { PropsWithChildren } from 'react';

import { describe, expect } from 'vitest';

import { ActionMenu } from '@navikt/ds-react';

import { LeggTilBarnPåBehandling } from './LeggTilBarnPåBehandling';
import { BehandlingProvider } from '../../../../sider/Fagsak/Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '../../../../sider/Fagsak/Behandling/context/HentOgSettBehandlingContext';
import { FagsakProvider } from '../../../../sider/Fagsak/FagsakContext';
import { lagBehandling } from '../../../../testutils/testdata/behandlingTestdata';
import { lagFagsak } from '../../../../testutils/testdata/fagsakTestdata';
import { render, TestProviders } from '../../../../testutils/testrender';
import { BehandlingÅrsak, type IBehandling, SettPåVentÅrsak } from '../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../typer/fagsak';

interface WrapperProps extends PropsWithChildren {
    fagsak?: IMinimalFagsak;
    behandling?: IBehandling;
}

function Wrapper({
    fagsak = lagFagsak(),
    behandling = lagBehandling({
        behandlingPåVent: undefined,
        årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
    }),
    children,
}: WrapperProps) {
    return (
        <TestProviders>
            <FagsakProvider fagsak={fagsak}>
                <HentOgSettBehandlingProvider>
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

describe('LeggTilBarnPåBehandling', () => {
    test('skal rendre komponenten', () => {
        const åpneModal = vi.fn();
        const { screen } = render(<LeggTilBarnPåBehandling åpneModal={åpneModal} />, { wrapper: Wrapper });
        expect(screen.getByRole('menuitem', { name: 'Legg til barn' })).toBeInTheDocument();
    });

    test('skal ikke rendre komponenten i lesevisning', () => {
        const åpneModal = vi.fn();
        const { screen } = render(<LeggTilBarnPåBehandling åpneModal={åpneModal} />, {
            wrapper: props => (
                <Wrapper
                    {...props}
                    behandling={lagBehandling({
                        behandlingPåVent: {
                            frist: '2025-10-10',
                            årsak: SettPåVentÅrsak.AVVENTER_BEHANDLING,
                        },
                        årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
                    })}
                />
            ),
        });
        expect(screen.queryByRole('menuitem', { name: 'Legg til barn' })).not.toBeInTheDocument();
    });

    test('skal ikke rendre komponenten hvis behandlingsårsaken er urelevant', () => {
        const åpneModal = vi.fn();
        const { screen } = render(<LeggTilBarnPåBehandling åpneModal={åpneModal} />, {
            wrapper: props => (
                <Wrapper
                    {...props}
                    behandling={lagBehandling({
                        behandlingPåVent: undefined,
                        årsak: BehandlingÅrsak.SØKNAD,
                    })}
                />
            ),
        });
        expect(screen.queryByRole('menuitem', { name: 'Legg til barn' })).not.toBeInTheDocument();
    });

    test('skal kunne åpne modal', async () => {
        const åpneModal = vi.fn();
        const { screen, user } = render(<LeggTilBarnPåBehandling åpneModal={åpneModal} />, { wrapper: Wrapper });
        const knapp = screen.getByRole('menuitem', { name: 'Legg til barn' });
        await user.click(knapp);
        expect(åpneModal).toHaveBeenCalledOnce();
    });
});
