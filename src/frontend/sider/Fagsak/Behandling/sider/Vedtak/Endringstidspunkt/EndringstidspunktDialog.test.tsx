import type { PropsWithChildren } from 'react';

import { BehandlingProvider } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '@sider/Fagsak/Behandling/context/HentOgSettBehandlingContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import { server } from '@testutils/mocks/node';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { BehandlingStatus, type IBehandling } from '@typer/behandling';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { EndringstidspunktDialog } from './EndringstidspunktDialog';
import { EndringstidspunktDialogProvider } from './EndringstidspunktDialogContext';

interface Props extends PropsWithChildren {
    behandling?: IBehandling;
}

function Wrapper({ behandling = lagBehandling(), children }: Props) {
    return (
        <TestProviders>
            <FagsakProvider fagsak={lagFagsak()}>
                <HentOgSettBehandlingProvider>
                    <BehandlingProvider behandling={behandling}>
                        <EndringstidspunktDialogProvider>
                            {({ erDialogÅpen, åpneDialog }) => (
                                <>
                                    {!erDialogÅpen && <button onClick={åpneDialog}>Åpne dialog</button>}
                                    {erDialogÅpen && children}
                                </>
                            )}
                        </EndringstidspunktDialogProvider>
                    </BehandlingProvider>
                </HentOgSettBehandlingProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

async function renderÅpenDialog(behandling?: IBehandling) {
    const renderResult = render(<EndringstidspunktDialog />, {
        wrapper: ({ children }) => <Wrapper behandling={behandling}>{children}</Wrapper>,
    });
    const { screen, user } = renderResult;

    await user.click(screen.getByRole('button', { name: 'Åpne dialog' }));
    await screen.findByRole('dialog');

    return renderResult;
}

describe('EndringstidspunktDialog', () => {
    test('viser ikke dialogen før den er åpnet', () => {
        const { screen } = render(<EndringstidspunktDialog />, { wrapper: Wrapper });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('viser "Ingen endringstidspunkt" når behandlingen ikke har et endringstidspunkt', async () => {
        const { screen } = await renderÅpenDialog(lagBehandling({ endringstidspunkt: undefined }));

        expect(screen.getByRole('heading', { name: 'Oppdater endringstidspunkt' })).toBeInTheDocument();
        expect(screen.getByText('Ingen endringstidspunkt')).toBeInTheDocument();
    });

    test('viser formatert dato når behandlingen har et endringstidspunkt', async () => {
        const { screen } = await renderÅpenDialog(lagBehandling({ endringstidspunkt: '2024-01-15' }));

        expect(screen.getByText('15.01.2024')).toBeInTheDocument();
    });

    test('lukker dialogen når man klikker på Avbryt', async () => {
        const { screen, user } = await renderÅpenDialog();

        await user.click(screen.getByRole('button', { name: 'Avbryt' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('viser Oppdater-knapp når man ikke er i lesevisning', async () => {
        const { screen } = await renderÅpenDialog(lagBehandling({ status: BehandlingStatus.UTREDES }));

        expect(screen.getByRole('button', { name: 'Oppdater' })).toBeInTheDocument();
    });

    test('viser ikke Oppdater-knapp når man er i lesevisning', async () => {
        const { screen } = await renderÅpenDialog(lagBehandling({ status: BehandlingStatus.AVSLUTTET }));

        expect(screen.queryByRole('button', { name: 'Oppdater' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
    });

    test('viser feilmelding og lukker ikke dialogen når man sender inn skjemaet uten å velge en dato', async () => {
        const { screen, user } = await renderÅpenDialog();

        await user.click(screen.getByRole('button', { name: 'Oppdater' }));

        expect(await screen.findByText('Du må velge en gyldig dato.')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('oppdaterer endringstidspunkt og lukker dialogen ved vellykket innsending', async () => {
        const behandling = lagBehandling({ behandlingId: 1, endringstidspunkt: undefined });
        const oppdatertBehandling = lagBehandling({ behandlingId: 1, endringstidspunkt: '2024-01-15' });

        server.use(
            http.put('/familie-ks-sak/api/vedtaksperioder/endringstidspunkt', () =>
                HttpResponse.json(byggSuksessRessurs(oppdatertBehandling))
            )
        );

        const { screen, user } = await renderÅpenDialog(behandling);

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.click(datofelt);
        await user.type(datofelt, '15.01.2024');

        await user.click(screen.getByRole('button', { name: 'Oppdater' }));

        await screen.findByRole('button', { name: 'Åpne dialog' });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('viser feilmelding fra api og lar dialogen stå åpen ved feilet innsending', async () => {
        const behandling = lagBehandling({ behandlingId: 2, endringstidspunkt: undefined });

        server.use(http.put('/familie-ks-sak/api/vedtaksperioder/endringstidspunkt', () => HttpResponse.error()));

        const { screen, user } = await renderÅpenDialog(behandling);

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.click(datofelt);
        await user.type(datofelt, '15.01.2024');

        await user.click(screen.getByRole('button', { name: 'Oppdater' }));

        expect(await screen.findByText('En feil har oppstått!')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});
