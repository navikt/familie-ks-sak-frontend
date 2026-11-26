import { byggFeiletRessurs, byggSuksessRessurs } from '@navikt/familie-typer';
import { BehandlingProvider } from '@sider/Fagsak/Behandling/BehandlingContext';
import { SimuleringContainer } from '@sider/Fagsak/Behandling/sider/Simulering/SimuleringContainer';
import { BrukerProvider } from '@sider/Fagsak/BrukerContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import { server } from '@testutils/mocks/node';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagPerson } from '@testutils/testdata/personTestdata';
import { SimuleringTestdata } from '@testutils/testdata/simuleringTestdata';
import { lagTilbakekreving } from '@testutils/testdata/tilbakekrevingTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { Tilbakekrevingsvalg } from '@typer/simulering';
import { HttpResponse, http } from 'msw';
import { FormProvider } from 'react-hook-form';
import { beforeEach, describe, expect, test } from 'vitest';

import { TilbakekrevingForm } from './TilbakekrevingForm';
import { useTilbakekrevingForm } from './useTilbakekrevingForm';

const TILBAKEKREVING_URL = '/familie-ks-sak/api/tilbakekreving/behandling/:behandlingId';

function Tilbakekrevingsskjema() {
    const { form } = useTilbakekrevingForm();
    return (
        <FormProvider {...form}>
            <TilbakekrevingForm />
        </FormProvider>
    );
}

function renderTilbakekrevingsskjema() {
    return render(
        <SimuleringContainer>
            <Tilbakekrevingsskjema />
        </SimuleringContainer>,
        {
            wrapper: ({ children }) => (
                <TestProviders>
                    <FagsakProvider fagsak={lagFagsak()}>
                        <BrukerProvider bruker={lagPerson()}>
                            <BehandlingProvider behandling={lagBehandling()}>{children}</BehandlingProvider>
                        </BrukerProvider>
                    </FagsakProvider>
                </TestProviders>
            ),
        }
    );
}

beforeEach(() => {
    server.use(
        http.get('/familie-ks-sak/api/behandlinger/:behandlingId/simulering', () =>
            HttpResponse.json(byggSuksessRessurs(SimuleringTestdata.lagSimulering({ feilutbetaling: 1000 })))
        ),
        http.get(encodeURI('/familie-ks-sak/api/fagsaker/:fagsakId/har-åpen-tilbakekrevingsbehandling'), () =>
            HttpResponse.json(byggSuksessRessurs(false))
        )
    );
});

describe('TilbakekrevingForm', () => {
    test('skal vise lagret tilbakekrevingsvalg fra endepunktet', async () => {
        server.use(
            http.get(TILBAKEKREVING_URL, () =>
                HttpResponse.json(
                    byggSuksessRessurs(
                        lagTilbakekreving({
                            valg: Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
                            begrunnelse: 'Lagret begrunnelse',
                        })
                    )
                )
            )
        );

        const { screen } = renderTilbakekrevingsskjema();

        expect(await screen.findByRole('radio', { name: 'Opprett tilbakekreving, ikke send varsel' })).toBeChecked();
        expect(screen.getByRole('textbox', { name: /^Årsak til feilutbetaling og videre behandling/ })).toHaveValue(
            'Lagret begrunnelse'
        );
    });

    test('skal vise feilmelding når tilbakekrevingen ikke kan hentes', async () => {
        server.use(
            http.get(TILBAKEKREVING_URL, () =>
                HttpResponse.json(byggFeiletRessurs('Klarte ikke å hente tilbakekreving'))
            )
        );

        const { screen } = renderTilbakekrevingsskjema();

        expect(await screen.findByText('Klarte ikke å hente tilbakekreving')).toBeInTheDocument();
        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
});
