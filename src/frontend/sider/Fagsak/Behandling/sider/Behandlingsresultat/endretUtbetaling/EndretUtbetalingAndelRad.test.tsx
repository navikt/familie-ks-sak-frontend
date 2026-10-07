import { Table } from '@navikt/ds-react';
import { byggFunksjonellFeilRessurs, byggSuksessRessurs } from '@navikt/familie-typer';
import { within } from '@testing-library/react';
import { server } from '@testutils/mocks/node';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagGrunnlagPerson } from '@testutils/testdata/personTestdata';
import { lagSaksbehandler } from '@testutils/testdata/saksbehandlerTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { BehandlingStatus, type IBehandling } from '@typer/behandling';
import { PersonType } from '@typer/person';
import { IEndretUtbetalingAndelÅrsak, type IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, test } from 'vitest';

import { FagsakProvider } from '../../../../FagsakContext';
import { BehandlingProvider } from '../../../context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '../../../context/HentOgSettBehandlingContext';
import { EndretUtbetalingAndelProvider } from './EndretUtbetalingAndelContext';
import { EndretUtbetalingAndelRad } from './EndretUtbetalingAndelRad';

const barnIdent = '12345678910';
const annetBarnIdent = '10987654321';
const url = '/familie-ks-sak/api/endretutbetalingandel/1/10';

const endretUtbetalingAndel: IRestEndretUtbetalingAndel = {
    id: 10,
    personIdenter: [barnIdent],
    prosent: 100,
    fom: '2024-01',
    tom: '2024-06',
    årsak: IEndretUtbetalingAndelÅrsak.ETTERBETALING_3MND,
    søknadstidspunkt: '2024-02-15',
    begrunnelse: 'Lagret begrunnelse',
    erTilknyttetAndeler: true,
    erEksplisittAvslagPåSøknad: false,
    vedtaksbegrunnelser: [],
};

const nyAndel: IRestEndretUtbetalingAndel = { id: 10, erTilknyttetAndeler: false };

function lagTestbehandling(behandling: Partial<IBehandling> = {}) {
    return lagBehandling({
        personer: [
            lagGrunnlagPerson({ personIdent: barnIdent, type: PersonType.BARN, navn: 'Barn Barnesen' }),
            lagGrunnlagPerson({ personIdent: annetBarnIdent, type: PersonType.BARN, navn: 'Annet Barnesen' }),
        ],
        personerMedAndelerTilkjentYtelse: [
            { personIdent: barnIdent, ytelsePerioder: [], beløp: 7500, stønadFom: '2023-01', stønadTom: '2025-12' },
            {
                personIdent: annetBarnIdent,
                ytelsePerioder: [],
                beløp: 7500,
                stønadFom: '2023-01',
                stønadTom: '2025-12',
            },
        ],
        ...behandling,
    });
}

function renderRad(endretUtbetalingAndel: IRestEndretUtbetalingAndel, behandling = lagTestbehandling()) {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <TestProviders saksbehandler={lagSaksbehandler({ harSuperbrukertilgang: true })}>
                <FagsakProvider fagsak={lagFagsak()}>
                    <HentOgSettBehandlingProvider>
                        <BehandlingProvider behandling={behandling}>
                            <Table>
                                <Table.Body>{children}</Table.Body>
                            </Table>
                        </BehandlingProvider>
                    </HentOgSettBehandlingProvider>
                </FagsakProvider>
            </TestProviders>
        );
    }
    return render(
        <EndretUtbetalingAndelProvider endretUtbetalingAndel={endretUtbetalingAndel}>
            <EndretUtbetalingAndelRad />
        </EndretUtbetalingAndelProvider>,
        { wrapper: Wrapper }
    );
}

async function åpneRad(user: ReturnType<typeof renderRad>['user'], screen: ReturnType<typeof renderRad>['screen']) {
    await user.click(screen.getByRole('button', { name: /vis mer/i }));
}

describe('EndretUtbetalingAndelRad', () => {
    test('skal vise skjemaet åpent uten forhåndsvalgt utbetaling for en ny andel', () => {
        // Arrange
        const { screen } = renderRad(nyAndel);

        // Assert
        expect(screen.getByRole('radio', { name: 'Perioden skal utbetales' })).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'Perioden skal ikke utbetales' })).not.toBeChecked();
    });

    test('skal kreve at utbetaling og øvrige felter fylles ut for en ny andel', async () => {
        // Arrange
        const { screen, user } = renderRad(nyAndel);

        // Act
        await user.click(screen.getByRole('button', { name: 'Bekreft' }));

        // Assert
        expect(await screen.findByText('Du må velge om perioden skal utbetales')).toBeInTheDocument();
        expect(screen.getByText('Du må velge minst én person')).toBeInTheDocument();
        expect(screen.getByText('Du må velge en årsak')).toBeInTheDocument();
        expect(screen.getByText('Du må velge f.o.m-dato')).toBeInTheDocument();
        expect(screen.getByText('Du må velge t.o.m-dato')).toBeInTheDocument();
        expect(screen.getByText('Du må oppgi en begrunnelse.')).toBeInTheDocument();
    });

    test('skal vise lagrede verdier for en eksisterende andel', async () => {
        // Arrange
        const { screen, user } = renderRad(endretUtbetalingAndel);

        // Act
        await åpneRad(user, screen);

        // Assert
        expect(screen.getByRole('radio', { name: 'Perioden skal utbetales' })).toBeChecked();
        expect(screen.getByRole('combobox', { name: 'Årsak' })).toHaveValue(
            IEndretUtbetalingAndelÅrsak.ETTERBETALING_3MND
        );
        expect(screen.getByRole('textbox', { name: 'Begrunnelse' })).toHaveValue('Lagret begrunnelse');
    });

    test('skal sende alle valgte personer i personIdenter ved lagring', async () => {
        // Arrange
        let mottattPayload: Record<string, unknown> | undefined;
        server.use(
            http.put(url, async ({ request }) => {
                mottattPayload = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json(byggSuksessRessurs(lagTestbehandling()));
            })
        );
        const { screen, user } = renderRad(endretUtbetalingAndel);

        // Act
        await åpneRad(user, screen);
        await user.click(screen.getByRole('combobox', { name: 'Velg hvem det gjelder' }));
        await user.click(await screen.findByRole('option', { name: /Annet Barnesen/ }));
        await user.click(screen.getByRole('radio', { name: 'Perioden skal ikke utbetales' }));
        await user.click(screen.getByRole('button', { name: 'Bekreft' }));

        // Assert
        await expect.poll(() => mottattPayload).toBeDefined();
        expect(mottattPayload).toMatchObject({
            id: 10,
            personIdenter: [barnIdent, annetBarnIdent],
            prosent: 0,
            fom: '2024-01',
        });
        expect(mottattPayload).not.toHaveProperty('personIdent');
    });

    test('skal vise alle personer på andelen i raden', () => {
        // Arrange
        const { screen } = renderRad({ ...endretUtbetalingAndel, personIdenter: [barnIdent, annetBarnIdent] });

        // Assert
        const rad = screen.getByRole('row');
        expect(within(rad).getByText(/Barn Barnesen/)).toBeInTheDocument();
        expect(within(rad).getByText(/Annet Barnesen/)).toBeInTheDocument();
    });

    test('skal vise "Ikke satt" og åpent skjema når andelen ikke har personer', () => {
        // Arrange
        const { screen } = renderRad({ ...endretUtbetalingAndel, personIdenter: [] });

        // Assert
        expect(screen.getByText('Ikke satt')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Bekreft' })).toBeInTheDocument();
    });

    test('skal kreve avslagsbegrunnelse når årsak er allerede utbetalt og vurderingen er et avslag', async () => {
        // Arrange
        const { screen, user } = renderRad(endretUtbetalingAndel);

        // Act
        await åpneRad(user, screen);
        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Årsak' }),
            IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT
        );
        await user.click(screen.getByRole('checkbox', { name: 'Vurderingen er et avslag' }));
        await user.click(screen.getByRole('button', { name: 'Bekreft' }));

        // Assert
        expect(await screen.findByText('Du må velge en begrunnelse ved avslag')).toBeInTheDocument();
    });

    test('skal vise avslagsbegrunnelser for allerede utbetalt', async () => {
        // Arrange
        const { screen, user } = renderRad(endretUtbetalingAndel);

        // Act
        await åpneRad(user, screen);
        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Årsak' }),
            IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT
        );
        await user.click(screen.getByRole('checkbox', { name: 'Vurderingen er et avslag' }));

        // Assert
        expect(await screen.findByRole('option', { name: 'Allerede utbetalt til søker' })).toBeInTheDocument();
    });

    test('skal skrivebeskytte avslagsbegrunnelser mens de lastes', async () => {
        // Arrange
        let svarPåBegrunnelser: () => void = () => {};
        const begrunnelserLastet = new Promise<void>(resolve => {
            svarPåBegrunnelser = resolve;
        });
        server.use(
            http.get('/familie-ks-sak/api/endretutbetalingandel/endret-utbetaling-vedtaksbegrunnelser', async () => {
                await begrunnelserLastet;
                return HttpResponse.json(byggFunksjonellFeilRessurs('Feil'));
            })
        );
        const { screen, user } = renderRad({
            ...endretUtbetalingAndel,
            prosent: 0,
            årsak: IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT,
            erEksplisittAvslagPåSøknad: true,
        });

        // Act
        await åpneRad(user, screen);

        // Assert
        expect(screen.getByRole('combobox', { name: /Velg standardtekst i brev/ })).toBeInTheDocument();
        expect(screen.getByTitle('Skrivebeskyttet')).toBeInTheDocument();

        // Act
        svarPåBegrunnelser();

        // Assert
        expect(
            await screen.findByText('Klarte ikke å hente inn begrunnelser for endret utbetaling.')
        ).toBeInTheDocument();
    });

    test('skal vise feilmelding når henting av avslagsbegrunnelser feiler', async () => {
        // Arrange
        server.use(
            http.get('/familie-ks-sak/api/endretutbetalingandel/endret-utbetaling-vedtaksbegrunnelser', () =>
                HttpResponse.json(byggFunksjonellFeilRessurs('Feil'))
            )
        );
        const { screen, user } = renderRad({
            ...endretUtbetalingAndel,
            prosent: 0,
            årsak: IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT,
            erEksplisittAvslagPåSøknad: true,
        });

        // Act
        await åpneRad(user, screen);

        // Assert
        expect(
            await screen.findByText('Klarte ikke å hente inn begrunnelser for endret utbetaling.')
        ).toBeInTheDocument();
    });

    test('skal fjerne avslag når utbetaling endres', async () => {
        // Arrange
        const { screen, user } = renderRad({ ...endretUtbetalingAndel, prosent: 0, erEksplisittAvslagPåSøknad: true });
        await åpneRad(user, screen);
        expect(screen.getByRole('checkbox', { name: 'Vurderingen er et avslag' })).toBeChecked();

        // Act
        await user.click(screen.getByRole('radio', { name: 'Perioden skal utbetales' }));
        await user.click(screen.getByRole('radio', { name: 'Perioden skal ikke utbetales' }));

        // Assert
        expect(screen.getByRole('checkbox', { name: 'Vurderingen er et avslag' })).not.toBeChecked();
    });

    test('skal vise feil fra backend om til og med dato på t.o.m-feltet', async () => {
        // Arrange
        server.use(
            http.put(url, () => HttpResponse.json(byggFunksjonellFeilRessurs('Ugyldig til og med dato for perioden')))
        );
        const { screen, user } = renderRad(endretUtbetalingAndel);

        // Act
        await åpneRad(user, screen);
        await user.click(screen.getByRole('button', { name: 'Bekreft' }));

        // Assert
        const tomFelt = screen.getByRole('textbox', { name: 'T.o.m' });
        await expect.poll(() => tomFelt.getAttribute('aria-invalid')).toBe('true');
        expect(screen.getByText('Ugyldig til og med dato for perioden')).toBeInTheDocument();
    });

    test('skal vise feil fra backend i varsel', async () => {
        // Arrange
        server.use(http.put(url, () => HttpResponse.json(byggFunksjonellFeilRessurs('Noe gikk galt'))));
        const { screen, user } = renderRad(endretUtbetalingAndel);

        // Act
        await åpneRad(user, screen);
        await user.click(screen.getByRole('button', { name: 'Bekreft' }));

        // Assert
        expect(await screen.findByText('Noe gikk galt')).toBeInTheDocument();
    });

    test('skal tilbakestille skjemaet ved avbryt', async () => {
        // Arrange
        const { screen, user } = renderRad(endretUtbetalingAndel);

        // Act
        await åpneRad(user, screen);
        const begrunnelse = screen.getByRole('textbox', { name: 'Begrunnelse' });
        await user.clear(begrunnelse);
        await user.type(begrunnelse, 'Endret');
        await user.click(screen.getByRole('button', { name: 'Avbryt' }));
        await åpneRad(user, screen);

        // Assert
        expect(screen.getByRole('textbox', { name: 'Begrunnelse' })).toHaveValue('Lagret begrunnelse');
    });

    test('skal kalle DELETE ved fjern periode', async () => {
        // Arrange
        let slettKalt = false;
        server.use(
            http.delete(url, () => {
                slettKalt = true;
                return HttpResponse.json(byggSuksessRessurs(lagTestbehandling()));
            })
        );
        const { screen, user } = renderRad(endretUtbetalingAndel);

        // Act
        await åpneRad(user, screen);
        await user.click(screen.getByRole('button', { name: 'Fjern periode' }));

        // Assert
        await expect.poll(() => slettKalt).toBe(true);
    });

    test('skal ikke vise knapper i lesevisning', async () => {
        // Arrange
        const { screen, user } = renderRad(
            endretUtbetalingAndel,
            lagTestbehandling({ status: BehandlingStatus.AVSLUTTET })
        );

        // Act
        await åpneRad(user, screen);

        // Assert
        expect(screen.getByRole('textbox', { name: 'Begrunnelse' })).toHaveAttribute('readonly');
        expect(screen.queryByRole('button', { name: 'Bekreft' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Fjern periode' })).not.toBeInTheDocument();
    });
});
