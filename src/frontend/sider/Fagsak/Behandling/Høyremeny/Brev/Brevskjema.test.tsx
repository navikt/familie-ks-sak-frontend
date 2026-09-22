import type { ReactNode } from 'react';

import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagPerson } from '@testutils/testdata/personTestdata';
import { lagSaksbehandler } from '@testutils/testdata/saksbehandlerTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { BehandlingStatus, Behandlingstype, BehandlingÅrsak, type IBehandling } from '@typer/behandling';
import { describe, expect, test, vi } from 'vitest';

import { Brevskjema } from './Brevskjema';
import { FagsakProvider } from '../../../FagsakContext';
import { BehandlingProvider } from '../../context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '../../context/HentOgSettBehandlingContext';

const OBLIGATORISK_FEILMELDING = 'Dette kulepunktet er obligatorisk. Du må skrive tekst i feltet.';

// Superbruker slik at saksbehandleren har tilgang til behandlende enhet og skjemaet ikke havner i lesevisning.
const superbruker = lagSaksbehandler({ harSuperbrukertilgang: true });

const revurdering = lagBehandling({
    type: Behandlingstype.REVURDERING,
    årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
});

function lagWrapper(behandling: IBehandling) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <TestProviders saksbehandler={superbruker}>
                <FagsakProvider fagsak={lagFagsak()}>
                    <HentOgSettBehandlingProvider>
                        <BehandlingProvider behandling={behandling}>{children}</BehandlingProvider>
                    </HentOgSettBehandlingProvider>
                </FagsakProvider>
            </TestProviders>
        );
    };
}

describe('Brevskjema', () => {
    test('skal ikke vise valideringsfeil når skjemaet lastes', () => {
        const { screen } = render(<Brevskjema onSubmitSuccess={vi.fn()} bruker={lagPerson()} />, {
            wrapper: lagWrapper(revurdering),
        });

        expect(screen.getByRole('button', { name: 'Send brev' })).toBeInTheDocument();
        expect(screen.queryByText('Du må velge en brevmal')).not.toBeInTheDocument();
        expect(screen.queryByText(OBLIGATORISK_FEILMELDING)).not.toBeInTheDocument();
    });

    test('skal vise valideringsfeil for obligatorisk kulepunkt ved innsending, og skjule den igjen når brevmal endres', async () => {
        const { screen, user } = render(<Brevskjema onSubmitSuccess={vi.fn()} bruker={lagPerson()} />, {
            wrapper: lagWrapper(revurdering),
        });

        const brevmalvelger = screen.getByRole('combobox', { name: 'Velg brevmal' });
        await user.selectOptions(brevmalvelger, 'VARSEL_OM_REVURDERING');

        // Innsending med tomt obligatorisk kulepunkt gjør at valideringsfeilen vises
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText(OBLIGATORISK_FEILMELDING)).toBeInTheDocument();

        // Ved bytte av brevmal skal skjemaet nullstilles slik at feilen ikke lenger vises
        await user.selectOptions(brevmalvelger, 'FORLENGET_SVARTIDSBREV');
        expect(screen.queryByText(OBLIGATORISK_FEILMELDING)).not.toBeInTheDocument();
    });

    test('skal ikke vise skjemaet under lesevisning', () => {
        const avsluttetBehandling = lagBehandling({
            type: Behandlingstype.REVURDERING,
            årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
            status: BehandlingStatus.AVSLUTTET,
        });

        const { screen } = render(<Brevskjema onSubmitSuccess={vi.fn()} bruker={lagPerson()} />, {
            wrapper: lagWrapper(avsluttetBehandling),
        });

        expect(screen.queryByRole('button', { name: 'Send brev' })).not.toBeInTheDocument();
    });
});
