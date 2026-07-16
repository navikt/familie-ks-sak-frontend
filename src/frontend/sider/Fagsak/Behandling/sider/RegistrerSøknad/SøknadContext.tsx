import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { useBruker } from '@hooks/useBruker';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsak } from '@hooks/useFagsak';
import { useRegistrerSøknad } from '@hooks/useRegistrerSøknad';
import { ForelderBarnRelasjonRolle, type IForelderBarnRelasjon } from '@typer/person';
import type { IBarnMedOpplysninger, IBarnMedOpplysningerBackend, Målform } from '@typer/søknad';
import { hentBarnMedLøpendeUtbetaling } from '@utils/fagsak';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useBehandlingContext } from '../../context/BehandlingContext';

export enum RegistrerSøknadFelt {
    BARNA_MED_OPPLYSNINGER = 'barnaMedOpplysninger',
    ENDRING_AV_OPPLYSNINGER_BEGRUNNELSE = 'endringAvOpplysningerBegrunnelse',
    MÅLFORM = 'målform',
}

export interface RegistrerSøknadFormValues {
    [RegistrerSøknadFelt.BARNA_MED_OPPLYSNINGER]: IBarnMedOpplysninger[];
    [RegistrerSøknadFelt.ENDRING_AV_OPPLYSNINGER_BEGRUNNELSE]: string;
    [RegistrerSøknadFelt.MÅLFORM]: Målform | undefined;
}

interface SøknadContextValue {
    barnMedLøpendeUtbetaling: Set<string>;
    erSenderInn: boolean;
    nesteAction: (bekreftEndringerViaFrontend: boolean) => void;
    søknadErLastetFraBackend: boolean;
}

const SøknadContext = createContext<SøknadContextValue | undefined>(undefined);

export const SøknadProvider = ({ children }: PropsWithChildren) => {
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const fagsak = useFagsak();
    const bruker = useBruker();
    const erLesevisning = useErLesevisning();
    const navigate = useNavigate();

    const [søknadErLastetFraBackend, settSøknadErLastetFraBackend] = useState(false);

    const barnMedLøpendeUtbetaling = hentBarnMedLøpendeUtbetaling(fagsak);

    const { mutateAsync: registrerSøknad, isPending } = useRegistrerSøknad();

    const form = useForm<RegistrerSøknadFormValues>({
        defaultValues: {
            [RegistrerSøknadFelt.BARNA_MED_OPPLYSNINGER]: [],
            [RegistrerSøknadFelt.ENDRING_AV_OPPLYSNINGER_BEGRUNNELSE]: '',
            [RegistrerSøknadFelt.MÅLFORM]: undefined,
        },
    });

    const { reset, setError, handleSubmit } = form;

    const byggBarnaFraFolkeregister = (): IBarnMedOpplysninger[] =>
        bruker.forelderBarnRelasjon
            .filter((relasjon: IForelderBarnRelasjon) => relasjon.relasjonRolle === ForelderBarnRelasjonRolle.BARN)
            .map(
                (relasjon: IForelderBarnRelasjon): IBarnMedOpplysninger => ({
                    merket: false,
                    ident: relasjon.personIdent,
                    navn: relasjon.navn,
                    fødselsdato: relasjon.fødselsdato,
                    manueltRegistrert: false,
                    erFolkeregistrert: true,
                })
            );

    const tilbakestillSøknad = () => {
        reset({
            [RegistrerSøknadFelt.BARNA_MED_OPPLYSNINGER]: byggBarnaFraFolkeregister(),
            [RegistrerSøknadFelt.ENDRING_AV_OPPLYSNINGER_BEGRUNNELSE]: '',
            [RegistrerSøknadFelt.MÅLFORM]: undefined,
        });
        settSøknadErLastetFraBackend(false);
    };

    useEffect(() => {
        tilbakestillSøknad();
    }, [bruker]);

    useEffect(() => {
        if (behandling.søknadsgrunnlag) {
            settSøknadErLastetFraBackend(true);
            reset({
                [RegistrerSøknadFelt.BARNA_MED_OPPLYSNINGER]: behandling.søknadsgrunnlag.barnaMedOpplysninger.map(
                    (barnMedOpplysninger: IBarnMedOpplysningerBackend) => ({
                        ...barnMedOpplysninger,
                        merket: barnMedOpplysninger.inkludertISøknaden,
                    })
                ),
                [RegistrerSøknadFelt.ENDRING_AV_OPPLYSNINGER_BEGRUNNELSE]:
                    behandling.søknadsgrunnlag.endringAvOpplysningerBegrunnelse,
                [RegistrerSøknadFelt.MÅLFORM]: behandling.søknadsgrunnlag.søkerMedOpplysninger.målform,
            });
        } else {
            // Ny behandling er lastet som ikke har fullført søknad-steget.
            tilbakestillSøknad();
        }
    }, [behandling]);

    const sendInn = async (values: RegistrerSøknadFormValues, bekreftEndringerViaFrontend: boolean) => {
        return registrerSøknad({
            behandlingId: behandling.behandlingId,
            søknad: {
                søknad: {
                    søkerMedOpplysninger: {
                        ident: bruker.personIdent,
                        målform: values.målform,
                    },
                    barnaMedOpplysninger: values.barnaMedOpplysninger.map(
                        (barn: IBarnMedOpplysninger): IBarnMedOpplysningerBackend => ({
                            ...barn,
                            inkludertISøknaden: barn.merket,
                            ident: barn.ident ?? '',
                        })
                    ),
                    endringAvOpplysningerBegrunnelse: values.endringAvOpplysningerBegrunnelse,
                },
                bekreftEndringerViaFrontend,
            },
        })
            .then(oppdatertBehandling => {
                settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
                navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/vilkaarsvurdering`);
            })
            .catch((error: unknown) => {
                setError('root', {
                    message: error instanceof Error ? error.message : 'Teknisk feil ved registrering av søknad.',
                });
            });
    };

    const nesteAction = (bekreftEndringerViaFrontend: boolean) => {
        if (erLesevisning) {
            navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/vilkaarsvurdering`);
            return;
        }
        handleSubmit(values => sendInn(values, bekreftEndringerViaFrontend))();
    };

    return (
        <FormProvider {...form}>
            <SøknadContext.Provider
                value={{
                    barnMedLøpendeUtbetaling,
                    erSenderInn: isPending,
                    nesteAction,
                    søknadErLastetFraBackend,
                }}
            >
                {children}
            </SøknadContext.Provider>
        </FormProvider>
    );
};

export const useSøknadContext = () => {
    const context = useContext(SøknadContext);

    if (context === undefined) {
        throw new Error('useSøknadContext må brukes innenfor en SøknadProvider');
    }

    return context;
};
