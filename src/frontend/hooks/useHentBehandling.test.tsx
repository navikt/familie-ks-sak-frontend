import { hentBehandling } from '@api/hentBehandling';
import { queryKeys } from '@hooks/keys/queryKeys';
import { useSkalObfuskereData } from '@hooks/useSkalObfuskereData';
import { renderHook, waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagBrevmottakerBehandling } from '@testutils/testdata/brevmottakerTestdata';
import { lagGrunnlagPerson } from '@testutils/testdata/personTestdata';
import { lagUtbetalingsperiode, lagUtbetalingsperiodeDetalj } from '@testutils/testdata/utbetalingsperiodeTestdata';
import { lagTestQueryClient, TestProviders } from '@testutils/testrender';
import { Brevmottakertype } from '@typer/brevmottaker';
import { PersonType } from '@typer/person';
import { Målform } from '@typer/søknad';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useHentBehandling } from './useHentBehandling';

vi.mock('@api/hentBehandling');
vi.mock('@hooks/useSkalObfuskereData');

beforeEach(() => {
    vi.mocked(useSkalObfuskereData).mockReturnValue(false);
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('useHentBehandling', () => {
    test('skal hente behandlingen uten å obfuskere når obfuskering er slått av', async () => {
        const behandling = lagBehandling({
            personer: [lagGrunnlagPerson()],
            brevmottakere: [lagBrevmottakerBehandling()],
        });
        vi.mocked(hentBehandling).mockResolvedValue(behandling);

        const { result } = renderHook(() => useHentBehandling(behandling.behandlingId), {
            wrapper: TestProviders,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(hentBehandling).toHaveBeenCalledWith({ behandlingId: behandling.behandlingId });
        expect(result.current.data).toEqual(behandling);
    });

    test('skal ikke hente behandling uten behandlingId', () => {
        const { result } = renderHook(() => useHentBehandling(undefined), {
            wrapper: TestProviders,
        });

        expect(result.current.fetchStatus).toBe('idle');
        expect(hentBehandling).not.toHaveBeenCalled();
    });

    test('skal returnere feil når henting av behandling feiler', async () => {
        const feil = new Error('Kunne ikke hente behandling');
        vi.mocked(hentBehandling).mockRejectedValue(feil);

        const { result } = renderHook(() => useHentBehandling(1), {
            wrapper: TestProviders,
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toBe(feil);
    });

    test('skal obfuskere uten å endre behandlingen og kunne vise originaldata uten ny henting', async () => {
        const behandling = lagBehandling({
            personer: [
                lagGrunnlagPerson({ navn: 'Søker', fødselsdato: '1990-01-01' }),
                lagGrunnlagPerson({ navn: 'Eldste barn', type: PersonType.BARN, fødselsdato: '2023-01-01' }),
                lagGrunnlagPerson({ navn: 'Yngste barn', type: PersonType.BARN, fødselsdato: '2024-01-01' }),
            ],
        });
        const originalBehandling = structuredClone(behandling);
        const queryClient = lagTestQueryClient();
        vi.mocked(hentBehandling).mockResolvedValue(behandling);
        vi.mocked(useSkalObfuskereData).mockReturnValue(true);

        const { result, rerender } = renderHook(() => useHentBehandling(behandling.behandlingId), {
            wrapper: ({ children }) => <TestProviders queryClient={queryClient}>{children}</TestProviders>,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.personer.map(person => person.navn)).toEqual([
            '[1] Barn Barnesen',
            '[2] Barn Barnesen',
            'Søker Søkersen',
        ]);
        expect(behandling).toEqual(originalBehandling);
        expect(queryClient.getQueryData(queryKeys.behandling(behandling.behandlingId))).toEqual(originalBehandling);

        vi.mocked(useSkalObfuskereData).mockReturnValue(false);
        rerender();

        await waitFor(() => expect(result.current.data).toEqual(originalBehandling));
        expect(hentBehandling).toHaveBeenCalledTimes(1);
    });

    test('skal obfuskere søknad, adresser, utbetalingsperioder og brevmottakere uten å mutere originaldata', async () => {
        const søker = lagGrunnlagPerson({
            navn: 'Søker',
            registerhistorikk: {
                hentetTidspunkt: '2025-01-01T12:00:00',
                sivilstand: [],
                oppholdstillatelse: [],
                statsborgerskap: [],
                bostedsadresse: [
                    { verdi: 'Tidligere adresse 1', fom: '2023-01-01', tom: '2023-12-31' },
                    { verdi: 'Nåværende adresse 2', fom: '2024-01-01' },
                ],
                oppholdsadresse: [],
                dødsboadresse: [],
            },
        });
        const eldsteBarn = lagGrunnlagPerson({
            navn: 'Eldste barn',
            type: PersonType.BARN,
            fødselsdato: '2023-01-01',
        });
        const yngsteBarn = lagGrunnlagPerson({
            navn: 'Yngste barn',
            type: PersonType.BARN,
            fødselsdato: '2024-01-01',
        });
        const utbetalingsperiode = lagUtbetalingsperiode({
            periodeFom: '2025-01-01',
            periodeTom: undefined,
            antallBarn: 2,
            utbetaltPerMnd: 15000,
            utbetalingsperiodeDetaljer: [søker, eldsteBarn, yngsteBarn].map(person =>
                lagUtbetalingsperiodeDetalj({ person })
            ),
        });
        const behandling = lagBehandling({
            personer: [søker],
            søknadsgrunnlag: {
                søkerMedOpplysninger: { ident: søker.personIdent, målform: Målform.NB },
                endringAvOpplysningerBegrunnelse: '',
                barnaMedOpplysninger: [eldsteBarn, yngsteBarn].map(barn => ({
                    navn: barn.navn,
                    fødselsdato: barn.fødselsdato,
                    ident: barn.personIdent,
                    inkludertISøknaden: true,
                    manueltRegistrert: false,
                    erFolkeregistrert: true,
                })),
            },
            utbetalingsperioder: [utbetalingsperiode, { ...utbetalingsperiode, periodeFom: '2025-02-01' }],
            brevmottakere: [
                lagBrevmottakerBehandling({ adresselinje2: 'Etasje 2' }),
                lagBrevmottakerBehandling({
                    id: 2,
                    type: Brevmottakertype.BRUKER_MED_UTENLANDSK_ADRESSE,
                    adresselinje2: 'Etasje 3',
                }),
            ],
        });
        const originalBehandling = structuredClone(behandling);
        const queryClient = lagTestQueryClient();
        vi.mocked(hentBehandling).mockResolvedValue(behandling);
        vi.mocked(useSkalObfuskereData).mockReturnValue(true);

        const { result } = renderHook(() => useHentBehandling(behandling.behandlingId), {
            wrapper: ({ children }) => <TestProviders queryClient={queryClient}>{children}</TestProviders>,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.søknadsgrunnlag?.barnaMedOpplysninger).toEqual([
            {
                ...behandling.søknadsgrunnlag?.barnaMedOpplysninger[1],
                navn: '[1] Barn Barnesen',
            },
            {
                ...behandling.søknadsgrunnlag?.barnaMedOpplysninger[0],
                navn: '[2] Barn Barnesen',
            },
        ]);
        expect(result.current.data?.personer[0]?.registerhistorikk?.bostedsadresse).toEqual([
            { verdi: 'Adresseveien 1', fom: '2023-01-01', tom: '2023-12-31' },
            { verdi: 'Adresseveien 1', fom: '2024-01-01' },
        ]);
        expect(
            result.current.data?.utbetalingsperioder.map(periode =>
                periode.utbetalingsperiodeDetaljer.map(detalj => detalj.person.navn)
            )
        ).toEqual([
            ['[1] Barn Barnesen', '[2] Barn Barnesen', 'Søker Søkersen'],
            ['[1] Barn Barnesen', '[2] Barn Barnesen', 'Søker Søkersen'],
        ]);
        expect(result.current.data?.brevmottakere).toEqual([
            {
                ...behandling.brevmottakere?.[0],
                navn: 'Fullmektig',
                adresselinje1: 'Mottakerveien 1',
                adresselinje2: undefined,
            },
            {
                ...behandling.brevmottakere?.[1],
                navn: 'Bruker med utenlandsk adresse',
                adresselinje1: 'Mottakerveien 1',
                adresselinje2: undefined,
            },
        ]);
        expect(behandling).toEqual(originalBehandling);
        expect(queryClient.getQueryData(queryKeys.behandling(behandling.behandlingId))).toEqual(originalBehandling);
    });

    test('skal kunne obfuskere behandling uten søknadsgrunnlag, registerhistorikk eller brevmottakere', async () => {
        const behandling = lagBehandling({
            personer: [lagGrunnlagPerson({ registerhistorikk: undefined })],
            søknadsgrunnlag: undefined,
            brevmottakere: undefined,
        });
        vi.mocked(hentBehandling).mockResolvedValue(behandling);
        vi.mocked(useSkalObfuskereData).mockReturnValue(true);

        const { result } = renderHook(() => useHentBehandling(behandling.behandlingId), {
            wrapper: TestProviders,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({
            ...behandling,
            personer: [{ ...behandling.personer[0], navn: 'Søker Søkersen' }],
        });
    });
});
