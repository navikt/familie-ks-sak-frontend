import { byggFunksjonellFeilRessurs, byggSuksessRessurs, type Ressurs } from '@navikt/familie-typer';

import { BehandlingProvider } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import { act, renderHook, waitFor } from '@testing-library/react';
import { server } from '@testutils/mocks/node';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { TestProviders } from '@testutils/testrender';
import type { IBehandling } from '@typer/behandling';
import type { IMinimalFagsak } from '@typer/fagsak';
import { HttpResponse, http } from 'msw';
import type { PropsWithChildren } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { EndringstidspunktDialogProvider, useEndringstidspunktDialogContext } from './EndringstidspunktDialogContext';
import { Feltnavn, useEndringstidspunktForm } from './useEndringstidspunktForm';

interface Props extends PropsWithChildren {
    fagsak?: IMinimalFagsak;
    behandling?: IBehandling;
    initialErÅpen?: boolean;
    settBehandlingRessurs?: (behandling: Ressurs<IBehandling>) => void;
}

function Wrapper({
    fagsak = lagFagsak(),
    behandling = lagBehandling(),
    initialErÅpen = true,
    settBehandlingRessurs = () => {},
    children,
}: Props) {
    return (
        <TestProviders>
            <FagsakProvider fagsak={fagsak}>
                <BehandlingProvider behandling={behandling} settBehandlingRessurs={settBehandlingRessurs}>
                    <EndringstidspunktDialogProvider initialErÅpen={initialErÅpen}>
                        {children}
                    </EndringstidspunktDialogProvider>
                </BehandlingProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

function renderUseEndringstidspunktForm(fagsak?: IMinimalFagsak, behandling?: IBehandling) {
    const settBehandlingRessurs = vi.fn<(behandling: Ressurs<IBehandling>) => void>();
    const rendret = renderHook(
        () => {
            const { form, onSubmit } = useEndringstidspunktForm();

            const endringstidspunktDialogContext = useEndringstidspunktDialogContext();

            // react-hook-form bruker en proxy for å avgjøre hvilke deler av formState den skal
            // abonnere på. Vi må lese errors under render for at endringer i setError skal føre
            // til at hooken faktisk rerenderes med den nye feilmeldingen.
            const { errors } = form.formState;

            return {
                form,
                onSubmit,
                errors,
                dialog: endringstidspunktDialogContext,
            };
        },
        {
            wrapper: ({ children }) => (
                <Wrapper fagsak={fagsak} behandling={behandling} settBehandlingRessurs={settBehandlingRessurs}>
                    {children}
                </Wrapper>
            ),
        }
    );
    return { ...rendret, settBehandlingRessurs };
}

describe('useEndringstidspunktForm', () => {
    test('gir riktig standardverdi for skjemaet', () => {
        const { result } = renderUseEndringstidspunktForm();

        expect(result.current.form.getValues()).toEqual({ [Feltnavn.ENDRINGSTIDSPUNKT]: null });
    });

    test('oppdaterer behandling, lukker dialog og nullstiller skjemaet ved vellykket innsending', async () => {
        const behandling = lagBehandling({ behandlingId: 1 });
        const oppdatertBehandling = lagBehandling({ behandlingId: 1, endringstidspunkt: '2024-01-01' });

        server.use(
            http.put('/familie-ks-sak/api/vedtaksperioder/endringstidspunkt', () =>
                HttpResponse.json(byggSuksessRessurs(oppdatertBehandling))
            )
        );

        const { result, settBehandlingRessurs } = renderUseEndringstidspunktForm(undefined, behandling);

        act(() => result.current.form.setValue(Feltnavn.ENDRINGSTIDSPUNKT, '2024-01-01', { shouldDirty: true }));

        await act(() => result.current.form.handleSubmit(result.current.onSubmit)());

        await waitFor(() => expect(result.current.dialog.erDialogÅpen).toBe(false));
        await waitFor(() =>
            expect(settBehandlingRessurs).toHaveBeenCalledWith(byggSuksessRessurs(oppdatertBehandling))
        );
        await waitFor(() => expect(result.current.form.getValues()).toEqual({ [Feltnavn.ENDRINGSTIDSPUNKT]: null }));
    });

    test('setter root-feil med feilmelding fra api og lar dialog stå åpen ved funksjonell feil', async () => {
        const behandling = lagBehandling({ behandlingId: 2 });

        server.use(
            http.put('/familie-ks-sak/api/vedtaksperioder/endringstidspunkt', () =>
                HttpResponse.json(byggFunksjonellFeilRessurs('Kunne ikke oppdatere endringstidspunkt.'))
            )
        );

        const { result } = renderUseEndringstidspunktForm(undefined, behandling);

        act(() => result.current.form.setValue(Feltnavn.ENDRINGSTIDSPUNKT, '2024-01-01', { shouldDirty: true }));

        await act(() => result.current.form.handleSubmit(result.current.onSubmit)());

        await waitFor(() =>
            expect(result.current.errors.root?.message).toBe('Kunne ikke oppdatere endringstidspunkt.')
        );
        expect(result.current.dialog.erDialogÅpen).toBe(true);
    });

    test('setter en generisk feilmelding og lar dialog stå åpen ved nettverksfeil', async () => {
        const behandling = lagBehandling({ behandlingId: 3 });

        server.use(http.put('/familie-ks-sak/api/vedtaksperioder/endringstidspunkt', () => HttpResponse.error()));

        const { result } = renderUseEndringstidspunktForm(undefined, behandling);

        act(() => result.current.form.setValue(Feltnavn.ENDRINGSTIDSPUNKT, '2024-01-01', { shouldDirty: true }));

        await act(() => result.current.form.handleSubmit(result.current.onSubmit)());

        await waitFor(() => expect(result.current.errors.root?.message).toBe('En feil har oppstått!'));
        expect(result.current.dialog.erDialogÅpen).toBe(true);
    });

    test('ber om bekreftelse ved nettleseroppdatering når skjemaet er endret', () => {
        const { result } = renderUseEndringstidspunktForm();

        act(() => result.current.form.setValue(Feltnavn.ENDRINGSTIDSPUNKT, '2024-01-01', { shouldDirty: true }));

        const event = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    test('ber ikke om bekreftelse ved nettleseroppdatering når skjemaet er uendret', () => {
        renderUseEndringstidspunktForm();

        const event = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
    });
});
