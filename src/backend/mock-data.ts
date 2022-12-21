import type { IKlagebehandling } from '../frontend/typer/klage';
import { KlageStatus } from '../frontend/typer/klage';

export const oppgaveMock = {
    data: {
        antallTreffTotalt: 2,
        oppgaver: [
            {
                id: 1,
                identer: [{ ident: '11111111111', gruppe: 'FOLKEREGISTERIDENT' }],
                tildeltEnhetsnr: '4820',
                journalpostId: '1234',
                behandlesAvApplikasjon: 'FS22',
                aktoerId: '1234',
                beskrivelse: 'Her skal det komme mockdata peace',
                tema: 'BAR',
                behandlingstema: 'ab0180',
                oppgavetype: 'JFR',
                fristFerdigstillelse: '2020-02-01',
                opprettetTidspunkt: '2020-01-01',
                prioritet: 'NORM',
                status: 'OPPRETTET',
            },
            {
                id: 2,
                identer: [{ ident: '11111111111', gruppe: 'FOLKEREGISTERIDENT' }],
                tildeltEnhetsnr: '4820',
                journalpostId: '1234',
                behandlesAvApplikasjon: 'FS22',
                aktoerId: '1234',
                tilordnetRessurs: 'Z999999',
                beskrivelse: 'Beskrivelse for oppgave',
                tema: 'BAR',
                behandlingstema: 'ab0180',
                oppgavetype: 'BEH_SAK',
                fristFerdigstillelse: '2020-02-01',
                opprettetTidspunkt: '2020-01-01',
                prioritet: 'NORM',
                status: 'OPPRETTET',
            },
        ],
    },
    status: 'SUKSESS',
    melding: 'Finn oppgaver OK',
    frontendFeilmelding: null,
    stacktrace: null,
};

export const fagsakMock = {
    data: {
        opprettetTidspunkt: '2021-10-05T13:19:10.077',
        id: 1000001,
        søkerFødselsnummer: '23456789101',
        status: 'OPPRETTET',
        underBehandling: false,
        behandlinger: [],
        gjeldendeUtbetalingsperioder: [],
        tilbakekrevingsbehandlinger: [],
    },
    status: 'SUKSESS',
    melding: 'Innhenting av data var vellykket',
    frontendFeilmelding: null,
    stacktrace: null,
};

export const personMock = {
    data: {
        personIdent: '23456789101',
        fødselsdato: '1965-02-19',
        navn: 'Mor Integrasjon person',
        kjønn: 'KVINNE',
        adressebeskyttelseGradering: null,
        harTilgang: true,
        forelderBarnRelasjon: [],
        forelderBarnRelasjonMaskert: [],
        kommunenummer: 'ukjent',
    },
    status: 'SUKSESS',
    melding: 'Innhenting av data var vellykket',
    frontendFeilmelding: null,
    stacktrace: null,
};

export const profileMock = {
    displayName: 'testbruker',
    email: 'test@test.no',
    enhet: '2970',
    identifier: 'test@test.no',
    navIdent: 'Z123456',
    groups: [
        '71f503a2-c28f-4394-a05a-8da263ceca4a',
        'c7e0b108-7ae6-432c-9ab4-946174c240c0',
        '52fe1bef-224f-49df-a40a-29f92d4520f8',
    ],
};

export const klagebehandlingFixture = (
    overstyrendeVerdier: Partial<IKlagebehandling> = {}
): IKlagebehandling => {
    const defaultVerdier: IKlagebehandling = {
        id: '0',
        fagsakId: '0',
        status: KlageStatus.OPPRETTET,
        opprettet: '2022-10-05',
        mottattDato: '2011-10-05',
        vedtaksdato: '2011-10-05',
        klageinstansResultat: [],
    };

    return { ...defaultVerdier, ...overstyrendeVerdier };
};
