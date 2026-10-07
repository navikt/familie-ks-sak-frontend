import { useBruker } from '@hooks/useBruker';
import { useFagsak } from '@hooks/useFagsak';
import { useForhåndsvisBrevPåFagsak } from '@hooks/useForhåndsvisBrevPåFagsak';
import { useOnFormSubmitSuccessful } from '@hooks/useOnFormSubmitSuccessful';
import { useSendInformasjonsbrev } from '@hooks/useSendInformasjonsbrev';
import { useBrevmottakereFagsakContext } from '@sider/Fagsak/BrevmottakereFagsakContext';
import type { DokumentÅrsak } from '@sider/Fagsak/Dokumentutsending/dokumentÅrsakTyper';
import type { IManueltBrevRequestPåFagsak } from '@typer/dokument';
import type { IPersonInfo } from '@typer/person';
import { ForelderBarnRelasjonRolle } from '@typer/person';
import { type IBarnMedOpplysninger, Målform } from '@typer/søknad';
import deepEqual from 'deep-equal';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { transformerSkjemaData } from './transformerSkjemaData';

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

export const dokumentutsendingSkjemaStandardverdier = (bruker: IPersonInfo): DokumentutsendingFormValues => ({
    [DokumentutsendingFeltnavn.ÅRSAK]: '',
    [DokumentutsendingFeltnavn.MÅLFORM]: Målform.NB,
    [DokumentutsendingFeltnavn.FRITEKST_AVSNITT]: '',
    [DokumentutsendingFeltnavn.VALGTE_BARN]: hentBarnMedOpplysningerFraBruker(bruker),
});

interface Props {
    åpneBrevSendtDialog: () => void;
    settForhåndsvisningUrl: (url: string) => void;
}

export function useDokumentutsendingSkjema({ åpneBrevSendtDialog, settForhåndsvisningUrl }: Props) {
    const bruker = useBruker();
    const fagsak = useFagsak();

    const { brevmottakere, slettAlleBrevmottakere } = useBrevmottakereFagsakContext();

    const form = useForm<DokumentutsendingFormValues>({
        defaultValues: dokumentutsendingSkjemaStandardverdier(bruker),
    });

    const { getValues, trigger, reset, setError, control } = form;

    useWatch({ control });
    useOnFormSubmitSuccessful(control, () => reset(dokumentutsendingSkjemaStandardverdier(bruker)));

    const [sistForhåndsvisteBrevRequest, settSistForhåndsvisteBrevRequest] = useState<IManueltBrevRequestPåFagsak>();

    const { mutateAsync: forhåndsvisBrev, isPending: forhåndsvisningLaster } = useForhåndsvisBrevPåFagsak(fagsak.id);
    const { mutateAsync: sendInformasjonsbrev } = useSendInformasjonsbrev(fagsak.id);

    const hentForhåndsvisning = () =>
        trigger().then(skjemaErGyldig => {
            if (skjemaErGyldig) {
                const skjemaverdier = getValues();
                const brevRequest = transformerSkjemaData({ skjemaverdier, bruker, brevmottakere });
                return forhåndsvisBrev(brevRequest)
                    .then(url => settForhåndsvisningUrl(url))
                    .then(() => settSistForhåndsvisteBrevRequest(brevRequest))
                    .catch(error => setError('root', { message: error.message }));
            }
        });

    const onSubmit = async (skjemaverdier: DokumentutsendingFormValues) => {
        return sendInformasjonsbrev(transformerSkjemaData({ skjemaverdier, bruker, brevmottakere }))
            .then(() => {
                åpneBrevSendtDialog();
                slettAlleBrevmottakere();
                settSistForhåndsvisteBrevRequest(undefined);
            })
            .catch(error => setError('root', { message: error.message }));
    };

    const skjemaverdier = getValues();
    const visForhåndsvisningBeskjed =
        !!skjemaverdier.årsak &&
        !deepEqual(transformerSkjemaData({ skjemaverdier, bruker, brevmottakere }), sistForhåndsvisteBrevRequest);

    return {
        form,
        onSubmit,
        hentForhåndsvisning,
        forhåndsvisningLaster,
        visForhåndsvisningBeskjed,
    };
}
