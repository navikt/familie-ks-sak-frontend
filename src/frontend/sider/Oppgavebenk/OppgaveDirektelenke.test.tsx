import { byggSuksessRessurs } from '@navikt/familie-typer';
import { server } from '@testutils/mocks/node';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagOppgave } from '@testutils/testdata/oppgaveTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { FagsakId } from '@typer/fagsak';
import { IdentGruppe, type IOppgaveIdent } from '@typer/oppgave';
import { Adressebeskyttelsegradering } from '@typer/person';
import { HttpResponse, http } from 'msw';
import type { PropsWithChildren } from 'react';
import { Route, Routes, useParams } from 'react-router';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { OppgaveDirektelenke } from './OppgaveDirektelenke';

const TILGANG_URL = '/familie-ks-sak/api/tilgang';
const HENT_FAGSAK_URL = '/familie-ks-sak/api/fagsaker/hent-fagsak-paa-person';

const identer: IOppgaveIdent[] = [{ ident: '12345678910', gruppe: IdentGruppe.FOLKEREGISTERIDENT }];

function mockTilgang(saksbehandlerHarTilgang: boolean) {
    server.use(
        http.post(TILGANG_URL, () =>
            HttpResponse.json(
                byggSuksessRessurs({
                    saksbehandlerHarTilgang,
                    adressebeskyttelsegradering: saksbehandlerHarTilgang
                        ? Adressebeskyttelsegradering.UGRADERT
                        : Adressebeskyttelsegradering.STRENGT_FORTROLIG,
                })
            )
        )
    );
}

function Saksoversikt() {
    const { fagsakId } = useParams();
    return <p>Saksoversikt for fagsak {fagsakId}</p>;
}

function Wrapper({ children }: PropsWithChildren) {
    return (
        <TestProviders>
            <Routes>
                <Route path={'/'} element={children} />
                <Route path={'/oppgaver/journalfor/:oppgaveId'} element={<p>Journalføring</p>} />
                <Route path={'/fagsak/:fagsakId/saksoversikt'} element={<Saksoversikt />} />
            </Routes>
        </TestProviders>
    );
}

describe('OppgaveDirektelenke', () => {
    beforeEach(() => {
        mockTilgang(true);
    });

    test('skal ikke vise knapp for oppgavetyper uten direktelenke', () => {
        const { screen } = render(<OppgaveDirektelenke oppgave={lagOppgave({ identer, oppgavetype: 'VUR' })} />, {
            wrapper: Wrapper,
        });

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('skal navigere til journalføring for JFR-oppgave når saksbehandler har tilgang', async () => {
        const { screen, user } = render(<OppgaveDirektelenke oppgave={lagOppgave({ identer, oppgavetype: 'JFR' })} />, {
            wrapper: Wrapper,
        });

        await user.click(screen.getByRole('button', { name: 'Se oppgave' }));

        expect(await screen.findByText('Journalføring')).toBeInTheDocument();
    });

    test('skal navigere til journalføring for BEH_SED-oppgave', async () => {
        const { screen, user } = render(
            <OppgaveDirektelenke oppgave={lagOppgave({ identer, oppgavetype: 'BEH_SED' })} />,
            { wrapper: Wrapper }
        );

        await user.click(screen.getByRole('button', { name: 'Gå til oppgave' }));

        expect(await screen.findByText('Journalføring')).toBeInTheDocument();
    });

    test('skal navigere til journalføring uten tilgangssjekk når JFR-oppgaven mangler fødselsnummer', async () => {
        const tilgangHandler = vi.fn(() => HttpResponse.json(byggSuksessRessurs({})));
        server.use(http.post(TILGANG_URL, tilgangHandler));
        const { screen, user } = render(
            <OppgaveDirektelenke oppgave={lagOppgave({ oppgavetype: 'JFR', identer: [] })} />,
            { wrapper: Wrapper }
        );

        await user.click(screen.getByRole('button', { name: 'Se oppgave' }));

        expect(await screen.findByText('Journalføring')).toBeInTheDocument();
        expect(tilgangHandler).not.toHaveBeenCalled();
    });

    test('skal vise mangler tilgang-modal og ikke navigere til journalføring når saksbehandler mangler tilgang', async () => {
        mockTilgang(false);
        const { screen, user } = render(<OppgaveDirektelenke oppgave={lagOppgave({ identer, oppgavetype: 'JFR' })} />, {
            wrapper: Wrapper,
        });

        await user.click(screen.getByRole('button', { name: 'Se oppgave' }));

        expect(await screen.findByRole('dialog', { name: 'Mangler tilgang' })).toBeInTheDocument();
        expect(screen.getByText('Ident har diskresjonskode strengt fortrolig.')).toBeInTheDocument();
        expect(screen.queryByText('Journalføring')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Se oppgave', hidden: true })).toBeEnabled();
    });

    test('skal vise teknisk feil-modal og ikke navigere til journalføring når tilgangssjekken feiler', async () => {
        server.use(http.post(TILGANG_URL, () => new HttpResponse(null, { status: 500 })));
        const { screen, user } = render(<OppgaveDirektelenke oppgave={lagOppgave({ identer, oppgavetype: 'JFR' })} />, {
            wrapper: Wrapper,
        });

        await user.click(screen.getByRole('button', { name: 'Se oppgave' }));

        expect(await screen.findByRole('dialog', { name: 'Teknisk feil' })).toBeInTheDocument();
        expect(screen.queryByText('Journalføring')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Se oppgave', hidden: true })).toBeEnabled();
    });

    test.each(['BEH_SAK', 'GOD_VED', 'BEH_UND_VED', 'VURD_LIVS', 'FREM'])(
        'skal navigere til saksoversikten for fagsaken til personen for %s-oppgave',
        async oppgavetype => {
            server.use(
                http.post(HENT_FAGSAK_URL, () =>
                    HttpResponse.json(byggSuksessRessurs(lagFagsak({ id: FagsakId.fra(42) })))
                )
            );
            const { screen, user } = render(<OppgaveDirektelenke oppgave={lagOppgave({ identer, oppgavetype })} />, {
                wrapper: Wrapper,
            });

            await user.click(screen.getByRole('button', { name: 'Gå til fagsak' }));

            expect(await screen.findByText('Saksoversikt for fagsak 42')).toBeInTheDocument();
        }
    );

    test('skal vise mangler tilgang-modal når BEH_SAK-oppgaven mangler fødselsnummer', async () => {
        const { screen, user } = render(
            <OppgaveDirektelenke oppgave={lagOppgave({ oppgavetype: 'BEH_SAK', identer: [] })} />,
            { wrapper: Wrapper }
        );

        await user.click(screen.getByRole('button', { name: 'Gå til fagsak' }));

        expect(await screen.findByRole('dialog', { name: 'Mangler tilgang' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Gå til fagsak', hidden: true })).toBeEnabled();
    });

    test('skal vise mangler tilgang-modal uten å hente fagsak når saksbehandler mangler tilgang', async () => {
        mockTilgang(false);
        const fagsakHandler = vi.fn(() => HttpResponse.json(byggSuksessRessurs(lagFagsak())));
        server.use(http.post(HENT_FAGSAK_URL, fagsakHandler));
        const { screen, user } = render(
            <OppgaveDirektelenke oppgave={lagOppgave({ identer, oppgavetype: 'BEH_SAK' })} />,
            { wrapper: Wrapper }
        );

        await user.click(screen.getByRole('button', { name: 'Gå til fagsak' }));

        expect(await screen.findByRole('dialog', { name: 'Mangler tilgang' })).toBeInTheDocument();
        expect(fagsakHandler).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Gå til fagsak', hidden: true })).toBeEnabled();
    });

    test('skal vise teknisk feil-modal når henting av fagsak feiler', async () => {
        server.use(http.post(HENT_FAGSAK_URL, () => new HttpResponse(null, { status: 500 })));
        const { screen, user } = render(
            <OppgaveDirektelenke oppgave={lagOppgave({ identer, oppgavetype: 'BEH_SAK' })} />,
            { wrapper: Wrapper }
        );

        await user.click(screen.getByRole('button', { name: 'Gå til fagsak' }));

        expect(await screen.findByRole('dialog', { name: 'Teknisk feil' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Gå til fagsak', hidden: true })).toBeEnabled();
    });
});
