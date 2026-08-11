import { OpprettBehandlingModal } from '@komponenter/Saklinje/Meny/OpprettBehandling/OpprettBehandlingModal';
import { BehandlingProvider } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '@sider/Fagsak/Behandling/context/HentOgSettBehandlingContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import type { RenderOptions } from '@testing-library/react';
import { lagBehandling, lagVisningBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { Behandlingstype, BehandlingÅrsak, type IBehandling } from '@typer/behandling';
import { FagsakStatus, type IMinimalFagsak } from '@typer/fagsak';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { describe, expect, test, vi } from 'vitest';

interface WrapperProps {
    fagsak?: IMinimalFagsak;
    behandling?: IBehandling;
    children: React.ReactNode;
}

function Wrapper({ fagsak = lagFagsak(), behandling = lagBehandling(), children }: WrapperProps) {
    return (
        <TestProviders>
            <FagsakProvider fagsak={fagsak}>
                <HentOgSettBehandlingProvider>
                    <BehandlingProvider behandling={behandling}>{children}</BehandlingProvider>
                </HentOgSettBehandlingProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

function renderOpprettBehandlingModal(wrapper: RenderOptions['wrapper'] = Wrapper) {
    const lukkModal = vi.fn();
    const onTilbakekrevingsbehandlingOpprettet = vi.fn();

    const utils = render(
        <OpprettBehandlingModal
            lukkModal={lukkModal}
            onTilbakekrevingsbehandlingOpprettet={onTilbakekrevingsbehandlingOpprettet}
        />,
        { wrapper }
    );

    return { ...utils, lukkModal, onTilbakekrevingsbehandlingOpprettet };
}

describe('OpprettBehandlingModal', () => {
    test('skal rendre modalen som forventet', () => {
        const { screen } = renderOpprettBehandlingModal();

        expect(screen.getByRole('dialog', { name: 'Opprett ny behandling' })).toBeInTheDocument();
        expect(screen.getByLabelText('Velg type behandling')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Bekreft' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Lukk' })).toBeInTheDocument();
    });

    test('skal rendre riktige felt ved førstegangsbehandling', async () => {
        const { screen, user } = renderOpprettBehandlingModal();

        const behandlingstypeFelt = screen.getByRole('combobox', { name: 'Velg type behandling' });
        await user.selectOptions(behandlingstypeFelt, Behandlingstype.FØRSTEGANGSBEHANDLING);
        expect(behandlingstypeFelt).toHaveValue(Behandlingstype.FØRSTEGANGSBEHANDLING);

        expect(screen.getByLabelText('Velg behandlingstema')).toBeInTheDocument();
        expect(screen.getByLabelText('Søknad mottatt dato')).toBeInTheDocument();
        // Årsaksfeltet skal ikke vises siden årsaken automatisk settes ved førstegangsbehandling
        expect(screen.queryByLabelText('Velg behandlingsårsak')).not.toBeInTheDocument();
    });

    test('skal rendre 360-dagers-alert ved søknadsdato som er mer enn 360 dager siden', async () => {
        const { screen, user } = renderOpprettBehandlingModal();

        const behandlingstypeFelt = screen.getByRole('combobox', { name: 'Velg type behandling' });
        await user.selectOptions(behandlingstypeFelt, Behandlingstype.FØRSTEGANGSBEHANDLING);

        const søknadMottattDatoFelt = screen.getByLabelText('Søknad mottatt dato');
        await user.type(søknadMottattDatoFelt, '01.01.2000');
        expect(søknadMottattDatoFelt).toHaveValue('01.01.2000');

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Det er mer enn 360 dager siden denne datoen.')).toBeInTheDocument();
    });

    test('skal rendre riktige felter ved revurdering', async () => {
        const { screen, user } = renderOpprettBehandlingModal(props => (
            <Wrapper
                {...props}
                fagsak={lagFagsak({
                    status: FagsakStatus.LØPENDE,
                    behandlinger: [lagVisningBehandling()],
                })}
            />
        ));

        const behandlingstypeFelt = screen.getByRole('combobox', { name: 'Velg type behandling' });
        await user.selectOptions(behandlingstypeFelt, Behandlingstype.REVURDERING);
        expect(behandlingstypeFelt).toHaveValue(Behandlingstype.REVURDERING);

        const behandlingsårsakFelt = screen.getByRole('combobox', { name: 'Velg behandlingsårsak' });
        await user.selectOptions(behandlingsårsakFelt, BehandlingÅrsak.SØKNAD);

        expect(screen.getByLabelText('Velg behandlingstema')).toBeInTheDocument();
        expect(screen.getByLabelText('Søknad mottatt dato')).toBeInTheDocument();
    });

    test('skal vise klageMottattDatoFelt ved klagebehandling', async () => {
        const { screen, user } = renderOpprettBehandlingModal();

        const behandlingstypeFelt = screen.getByRole('combobox', { name: 'Velg type behandling' });
        await user.selectOptions(behandlingstypeFelt, Klagebehandlingstype.KLAGE);
        expect(behandlingstypeFelt).toHaveValue(Klagebehandlingstype.KLAGE);

        const klageMottattDatoFelt = screen.getByLabelText('Klage mottatt dato');
        await user.type(klageMottattDatoFelt, '01.01.2000');
        expect(klageMottattDatoFelt).toHaveValue('01.01.2000');
    });

    test('skal velge Tilbakekreving som type behandling', async () => {
        const { screen, user } = renderOpprettBehandlingModal();

        const behandlingstypeFelt = screen.getByRole('combobox', { name: 'Velg type behandling' });
        await user.selectOptions(behandlingstypeFelt, Tilbakekrevingsbehandlingstype.TILBAKEKREVING);
        expect(behandlingstypeFelt).toHaveValue(Tilbakekrevingsbehandlingstype.TILBAKEKREVING);
    });

    test('skal kunne lukke modalen', async () => {
        const { screen, user, lukkModal } = renderOpprettBehandlingModal();

        expect(screen.getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Avbryt' }));
        expect(lukkModal).toHaveBeenCalledOnce();
    });
});
