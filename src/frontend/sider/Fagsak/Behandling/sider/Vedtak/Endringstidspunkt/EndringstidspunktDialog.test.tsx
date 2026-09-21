import { byggSuksessRessurs } from '@navikt/familie-typer';

import { BehandlingProvider } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '@sider/Fagsak/Behandling/context/HentOgSettBehandlingContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import { waitFor } from '@testing-library/dom';
import { server } from '@testutils/mocks/node';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { BehandlingStatus, type IBehandling } from '@typer/behandling';
import { HttpResponse, http } from 'msw';
import type { PropsWithChildren } from 'react';
import { describe, expect, test } from 'vitest';

import { EndringstidspunktDialog } from './EndringstidspunktDialog';
import { EndringstidspunktDialogProvider } from './EndringstidspunktDialogContext';

interface Props extends PropsWithChildren {
    behandling?: IBehandling;
    initialErÅpen?: boolean;
}

function Wrapper({ behandling = lagBehandling(), initialErÅpen = true, children }: Props) {
    return (
        <TestProviders>
            <FagsakProvider fagsak={lagFagsak()}>
                <HentOgSettBehandlingProvider>
                    <BehandlingProvider behandling={behandling}>
                        <EndringstidspunktDialogProvider initialErÅpen={initialErÅpen}>
                            {children}
                        </EndringstidspunktDialogProvider>
                    </BehandlingProvider>
                </HentOgSettBehandlingProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

describe('EndringstidspunktDialog', () => {
    test('viser ikke dialogen før den er åpnet', () => {
        const { screen } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => <Wrapper initialErÅpen={false}>{children}</Wrapper>,
        });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('viser "Ingen endringstidspunkt" når behandlingen ikke har et endringstidspunkt', () => {
        const { screen } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => (
                <Wrapper behandling={lagBehandling({ endringstidspunkt: undefined })}>{children}</Wrapper>
            ),
        });

        expect(screen.getByRole('heading', { name: 'Oppdater endringstidspunkt' })).toBeInTheDocument();
        expect(screen.getByText('Ingen endringstidspunkt')).toBeInTheDocument();
    });

    test('viser formatert dato når behandlingen har et endringstidspunkt', () => {
        const { screen } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => (
                <Wrapper behandling={lagBehandling({ endringstidspunkt: '2024-01-15' })}>{children}</Wrapper>
            ),
        });

        expect(screen.getByText('15.01.2024')).toBeInTheDocument();
    });

    test('lukker dialogen når man klikker på Avbryt', async () => {
        const { screen, user } = render(<EndringstidspunktDialog />, { wrapper: Wrapper });

        await user.click(screen.getByRole('button', { name: 'Avbryt' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    test('viser Oppdater-knapp når man ikke er i lesevisning', () => {
        const { screen } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => (
                <Wrapper behandling={lagBehandling({ status: BehandlingStatus.UTREDES })}>{children}</Wrapper>
            ),
        });

        expect(screen.getByRole('button', { name: 'Oppdater' })).toBeInTheDocument();
    });

    test('viser ikke Oppdater-knapp når man er i lesevisning', () => {
        const { screen } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => (
                <Wrapper behandling={lagBehandling({ status: BehandlingStatus.AVSLUTTET })}>{children}</Wrapper>
            ),
        });

        expect(screen.queryByRole('button', { name: 'Oppdater' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Avbryt' })).not.toBeInTheDocument();
        expect(screen.getByText('Lukk', { selector: 'button span' })).toBeInTheDocument();
    });

    test('lukker dialogen når man klikker på Lukk i lesevisning', async () => {
        const { screen, user } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => (
                <Wrapper behandling={lagBehandling({ status: BehandlingStatus.AVSLUTTET })}>{children}</Wrapper>
            ),
        });

        await user.click(screen.getByText('Lukk', { selector: 'button span' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    test('lukker dialogen når man trykker Escape', async () => {
        const { screen, user } = render(<EndringstidspunktDialog />, { wrapper: Wrapper });

        await user.keyboard('{Escape}');

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    test('lukker ikke dialogen mens skjemaet sendes inn', async () => {
        const behandling = lagBehandling({ behandlingId: 3, endringstidspunkt: undefined });
        const oppdatertBehandling = lagBehandling({ behandlingId: 3, endringstidspunkt: '2024-01-15' });

        let fullførForespørsel: () => void = () => {};
        const forespørselFullført = new Promise<void>(resolve => {
            fullførForespørsel = resolve;
        });

        server.use(
            http.put('/familie-ks-sak/api/vedtaksperioder/endringstidspunkt', async () => {
                await forespørselFullført;
                return HttpResponse.json(byggSuksessRessurs(oppdatertBehandling));
            })
        );

        const { screen, user } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => <Wrapper behandling={behandling}>{children}</Wrapper>,
        });

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.click(datofelt);
        await user.type(datofelt, '15.01.2024');

        await user.click(screen.getByRole('button', { name: 'Oppdater' }));

        await waitFor(() => expect(screen.getByRole('button', { name: 'Avbryt' })).toBeDisabled());

        await user.keyboard('{Escape}');

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        fullførForespørsel();

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    test('viser feilmelding og lukker ikke dialogen når man sender inn skjemaet uten å velge en dato', async () => {
        const { screen, user } = render(<EndringstidspunktDialog />, { wrapper: Wrapper });

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

        const { screen, user } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => <Wrapper behandling={behandling}>{children}</Wrapper>,
        });

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.click(datofelt);
        await user.type(datofelt, '15.01.2024');

        await user.click(screen.getByRole('button', { name: 'Oppdater' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    test('viser feilmelding fra api og lar dialogen stå åpen ved feilet innsending', async () => {
        const behandling = lagBehandling({ behandlingId: 2, endringstidspunkt: undefined });

        server.use(http.put('/familie-ks-sak/api/vedtaksperioder/endringstidspunkt', () => HttpResponse.error()));

        const { screen, user } = render(<EndringstidspunktDialog />, {
            wrapper: ({ children }) => <Wrapper behandling={behandling}>{children}</Wrapper>,
        });

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.click(datofelt);
        await user.type(datofelt, '15.01.2024');

        await user.click(screen.getByRole('button', { name: 'Oppdater' }));

        expect(await screen.findByText('En feil har oppstått!')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});
