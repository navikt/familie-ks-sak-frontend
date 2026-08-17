import type { PropsWithChildren } from 'react';

import { useForhåndsvisBrevPåFagsak } from '@hooks/useForhåndsvisBrevPåFagsak';
import { useSendInformasjonsbrev } from '@hooks/useSendInformasjonsbrev';
import { act, renderHook, waitFor } from '@testing-library/react';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagPerson } from '@testutils/testdata/personTestdata';
import { TestProviders } from '@testutils/testrender';
import { Adressebeskyttelsegradering, ForelderBarnRelasjonRolle } from '@typer/person';
import { Målform } from '@typer/søknad';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { BrukerProvider } from '../BrukerContext';
import { FagsakProvider } from '../FagsakContext';
import { ManuelleBrevmottakerePåFagsakProvider } from '../ManuelleBrevmottakerePåFagsakContext';
import { DokumentÅrsak } from './dokumentÅrsakTyper';
import { DokumentutsendingFeltnavn, useDokumentutsendingSkjema } from './useDokumentutsendingSkjema';

vi.mock('@hooks/useForhåndsvisBrevPåFagsak');
vi.mock('@hooks/useSendInformasjonsbrev');

const barnRelasjon = {
    adressebeskyttelseGradering: Adressebeskyttelsegradering.UGRADERT,
    fødselsdato: '2015-05-17',
    navn: 'Barn Barnesen',
    personIdent: '17051512345',
    relasjonRolle: ForelderBarnRelasjonRolle.BARN,
};

const morRelasjon = {
    ...barnRelasjon,
    navn: 'Mor Barnesen',
    personIdent: '11111111111',
    relasjonRolle: ForelderBarnRelasjonRolle.MOR,
};

const forhåndsvisBrev = vi.fn();
const sendInformasjonsbrev = vi.fn();

function lagWrapper(bruker: ReturnType<typeof lagPerson>) {
    return function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestProviders>
                <FagsakProvider fagsak={lagFagsak()}>
                    <BrukerProvider bruker={bruker}>
                        <ManuelleBrevmottakerePåFagsakProvider>{children}</ManuelleBrevmottakerePåFagsakProvider>
                    </BrukerProvider>
                </FagsakProvider>
            </TestProviders>
        );
    };
}

function renderSkjema(bruker = lagPerson({ forelderBarnRelasjon: [] })) {
    const åpneBrevSendtDialog = vi.fn();
    const settForhåndsvisningUrl = vi.fn();
    const hook = renderHook(() => useDokumentutsendingSkjema({ åpneBrevSendtDialog, settForhåndsvisningUrl }), {
        wrapper: lagWrapper(bruker),
    });
    return { ...hook, åpneBrevSendtDialog, settForhåndsvisningUrl };
}

describe('useDokumentutsendingSkjema', () => {
    beforeEach(() => {
        vi.mocked(useForhåndsvisBrevPåFagsak).mockReturnValue({
            mutateAsync: forhåndsvisBrev,
            isPending: false,
        } as unknown as ReturnType<typeof useForhåndsvisBrevPåFagsak>);
        vi.mocked(useSendInformasjonsbrev).mockReturnValue({
            mutateAsync: sendInformasjonsbrev,
        } as unknown as ReturnType<typeof useSendInformasjonsbrev>);
        vi.clearAllMocks();
    });

    test('bygger standardverdier med barn fra brukerens forelderBarnRelasjon', () => {
        const bruker = lagPerson({ forelderBarnRelasjon: [barnRelasjon, morRelasjon] });
        const { result } = renderSkjema(bruker);

        expect(result.current.form.getValues().valgteBarn).toEqual([
            {
                merket: false,
                ident: barnRelasjon.personIdent,
                navn: barnRelasjon.navn,
                fødselsdato: barnRelasjon.fødselsdato,
                manueltRegistrert: false,
                erFolkeregistrert: true,
            },
        ]);
    });

    test('har tomme standardverdier og bokmål som målform', () => {
        const { result } = renderSkjema();

        expect(result.current.form.getValues()).toEqual({
            årsak: '',
            målform: Målform.NB,
            fritekstAvsnitt: '',
            valgteBarn: [],
        });
    });

    test('setter forhåndsvisning og markerer request som forhåndsvist først etter suksess', async () => {
        forhåndsvisBrev.mockResolvedValue('blob:brev');
        const { result, settForhåndsvisningUrl } = renderSkjema();

        act(() => result.current.form.setValue(DokumentutsendingFeltnavn.ÅRSAK, DokumentÅrsak.KAN_SØKE_EØS));
        await waitFor(() => expect(result.current.form.getValues().årsak).toBe(DokumentÅrsak.KAN_SØKE_EØS));
        await act(() => result.current.hentForhåndsvisning());

        expect(settForhåndsvisningUrl).toHaveBeenCalledWith('blob:brev');
        expect(result.current.visForhåndsvisningBeskjed).toBe(false);
    });

    test('setter root-feil og beholder request som ikke forhåndsvist ved preview-feil', async () => {
        forhåndsvisBrev.mockRejectedValue(new Error('Kunne ikke forhåndsvise'));
        const { result, settForhåndsvisningUrl } = renderSkjema();
        void result.current.form.formState.errors;

        act(() => result.current.form.setValue(DokumentutsendingFeltnavn.ÅRSAK, DokumentÅrsak.KAN_SØKE_EØS));
        await act(() => result.current.hentForhåndsvisning());

        expect(settForhåndsvisningUrl).not.toHaveBeenCalled();
        expect(result.current.form.formState.errors.root?.message).toBe('Kunne ikke forhåndsvise');
        expect(result.current.visForhåndsvisningBeskjed).toBe(true);
    });

    test('åpner dialog og nullstiller skjema etter vellykket innsending', async () => {
        sendInformasjonsbrev.mockResolvedValue(undefined);
        const { result, åpneBrevSendtDialog, settForhåndsvisningUrl } = renderSkjema();
        act(() => result.current.form.setValue(DokumentutsendingFeltnavn.ÅRSAK, DokumentÅrsak.KAN_SØKE_EØS));

        await act(() => result.current.form.handleSubmit(result.current.onSubmit)());

        expect(åpneBrevSendtDialog).toHaveBeenCalledOnce();
        expect(settForhåndsvisningUrl).not.toHaveBeenCalled();
        await waitFor(() => expect(result.current.form.getValues().årsak).toBe(''));
    });

    test('setter root-feil uten å kaste sendefeilen videre', async () => {
        sendInformasjonsbrev.mockRejectedValue(new Error('Kunne ikke sende'));
        const { result, åpneBrevSendtDialog, settForhåndsvisningUrl } = renderSkjema();
        void result.current.form.formState.errors;
        act(() => result.current.form.setValue(DokumentutsendingFeltnavn.ÅRSAK, DokumentÅrsak.KAN_SØKE_EØS));

        await act(() => result.current.form.handleSubmit(result.current.onSubmit)());

        expect(result.current.form.formState.errors.root?.message).toBe('Kunne ikke sende');
        expect(åpneBrevSendtDialog).not.toHaveBeenCalled();
        expect(settForhåndsvisningUrl).not.toHaveBeenCalled();
    });
});
