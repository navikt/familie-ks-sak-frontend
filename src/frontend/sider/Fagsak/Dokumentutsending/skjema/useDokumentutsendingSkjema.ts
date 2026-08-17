import { useBruker } from '@hooks/useBruker';
import { useOnFormSubmitSuccessful } from '@hooks/useOnFormSubmitSuccessful';
import type { IPersonInfo } from '@typer/person';
import { ForelderBarnRelasjonRolle } from '@typer/person';
import type { IBarnMedOpplysninger } from '@typer/søknad';
import { Målform } from '@typer/søknad';
import { useForm } from 'react-hook-form';

import type { DokumentÅrsak } from '../dokumentÅrsakTyper';

export enum DokumentutsendingFeltnavn {
    ÅRSAK = 'årsak',
    MÅLFORM = 'målform',
    FRITEKST_AVSNITT = 'fritekstAvsnitt',
    VALGTE_BARN = 'valgteBarn',
}

export interface DokumentutsendingFormValues {
    [DokumentutsendingFeltnavn.ÅRSAK]: DokumentÅrsak | '';
    [DokumentutsendingFeltnavn.MÅLFORM]: Målform;
    [DokumentutsendingFeltnavn.FRITEKST_AVSNITT]: string;
    [DokumentutsendingFeltnavn.VALGTE_BARN]: IBarnMedOpplysninger[];
}

const hentBarnMedOpplysningerFraBruker = (bruker: IPersonInfo): IBarnMedOpplysninger[] =>
    bruker.forelderBarnRelasjon
        .filter(relasjon => relasjon.relasjonRolle === ForelderBarnRelasjonRolle.BARN)
        .map(
            (relasjon): IBarnMedOpplysninger => ({
                merket: false,
                ident: relasjon.personIdent,
                navn: relasjon.navn,
                fødselsdato: relasjon.fødselsdato,
                manueltRegistrert: false,
                erFolkeregistrert: true,
            })
        );

const dokumentutsendingSkjemaStandardverdier = (bruker: IPersonInfo): DokumentutsendingFormValues => ({
    [DokumentutsendingFeltnavn.ÅRSAK]: '',
    [DokumentutsendingFeltnavn.MÅLFORM]: Målform.NB,
    [DokumentutsendingFeltnavn.FRITEKST_AVSNITT]: '',
    [DokumentutsendingFeltnavn.VALGTE_BARN]: hentBarnMedOpplysningerFraBruker(bruker),
});

export function useDokumentutsendingSkjema() {
    const bruker = useBruker();

    const form = useForm<DokumentutsendingFormValues>({
        defaultValues: dokumentutsendingSkjemaStandardverdier(bruker),
    });

    const { reset, control } = form;

    useOnFormSubmitSuccessful(control, reset);

    const nullstillSkjemaMedÅrsak = (årsak: DokumentÅrsak | '') =>
        reset({
            ...dokumentutsendingSkjemaStandardverdier(bruker),
            [DokumentutsendingFeltnavn.ÅRSAK]: årsak,
        });

    return {
        ...form,
        nullstillSkjemaMedÅrsak,
    };
}
