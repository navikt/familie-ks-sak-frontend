import React, { createContext, useContext } from 'react';

import { useNavigate } from 'react-router';

import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import type { Avhengigheter, FeiloppsummeringFeil, ISkjema } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { useFagsakContext } from '../../../../../context/fagsak/FagsakContext';
import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import type { IBehandling } from '../../../../../typer/behandling';
import { ForelderBarnRelasjonRolle, type IForelderBarnRelasjon } from '../../../../../typer/person';
import type {
    IBarnMedOpplysninger,
    IBarnMedOpplysningerBackend,
    IRestRegistrerSøknad,
    Målform,
} from '../../../../../typer/søknad';
import { hentBarnMedLøpendeUtbetaling } from '../../../../../utils/fagsak';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

interface Props extends React.PropsWithChildren {
    åpenBehandling: IBehandling;
}

interface SøknadSkjema {
    barnaMedOpplysninger: IBarnMedOpplysninger[];
    endringAvOpplysningerBegrunnelse: string;
    målform: Målform | undefined;
}

interface SøknadContextValue {
    barnMedLøpendeUtbetaling: Set<string>;
    hentFeilTilOppsummering: () => FeiloppsummeringFeil[];
    nesteAction: (bekreftEndringerViaFrontend: boolean) => void;
    skjema: ISkjema<SøknadSkjema, IBehandling>;
    søknadErLastetFraBackend: boolean;
}

const SøknadContext = createContext<SøknadContextValue | undefined>(undefined);

export const SøknadProvider = ({ åpenBehandling, children }: Props) => {
    const { vurderErLesevisning, settÅpenBehandling } = useBehandlingContext();
    const { fagsakId } = useSakOgBehandlingParams();
    const navigate = useNavigate();
    const { bruker, minimalFagsakRessurs } = useFagsakContext();

    const barnMedLøpendeUtbetaling =
        minimalFagsakRessurs.status === RessursStatus.SUKSESS
            ? hentBarnMedLøpendeUtbetaling(minimalFagsakRessurs.data)
            : new Set<string>();

    const { skjema, nullstillSkjema, onSubmit, hentFeilTilOppsummering } = useSkjema<
        SøknadSkjema,
        IBehandling
    >({
        felter: {
            barnaMedOpplysninger: useFelt<IBarnMedOpplysninger[]>({
                verdi: [],
                valideringsfunksjon: (felt, avhengigheter?: Avhengigheter) => {
                    return felt.verdi.some((barn: IBarnMedOpplysninger) => barn.merket) ||
                        (avhengigheter?.barnMedLøpendeUtbetaling.size ?? []) > 0
                        ? ok(felt)
                        : feil(felt, 'Ingen av barna er valgt.');
                },
                avhengigheter: { barnMedLøpendeUtbetaling },
            }),
            endringAvOpplysningerBegrunnelse: useFelt<string>({
                verdi: '',
            }),
            målform: useFelt<Målform | undefined>({
                verdi: undefined,
                valideringsfunksjon: felt =>
                    felt.verdi !== undefined ? ok(felt) : feil(felt, 'Målform er ikke valgt.'),
            }),
        },
        skjemanavn: 'Registrer søknad',
    });

    const [søknadErLastetFraBackend, settSøknadErLastetFraBackend] = React.useState(false);

    const tilbakestillSøknad = () => {
        if (bruker.status === RessursStatus.SUKSESS) {
            nullstillSkjema();
            skjema.felter.barnaMedOpplysninger.validerOgSettFelt(
                bruker.data.forelderBarnRelasjon
                    .filter(
                        (relasjon: IForelderBarnRelasjon) =>
                            relasjon.relasjonRolle === ForelderBarnRelasjonRolle.BARN
                    )
                    .map(
                        (relasjon: IForelderBarnRelasjon): IBarnMedOpplysninger => ({
                            merket: false,
                            ident: relasjon.personIdent,
                            navn: relasjon.navn,
                            fødselsdato: relasjon.fødselsdato,
                            manueltRegistrert: false,
                            erFolkeregistrert: true,
                        })
                    ) ?? []
            );
        }
        settSøknadErLastetFraBackend(false);
    };

    React.useEffect(() => {
        tilbakestillSøknad();
    }, [bruker.status]);

    React.useEffect(() => {
        if (åpenBehandling.søknadsgrunnlag) {
            settSøknadErLastetFraBackend(true);
            skjema.felter.barnaMedOpplysninger.validerOgSettFelt(
                åpenBehandling.søknadsgrunnlag.barnaMedOpplysninger.map(
                    (barnMedOpplysninger: IBarnMedOpplysningerBackend) => ({
                        ...barnMedOpplysninger,
                        merket: barnMedOpplysninger.inkludertISøknaden,
                    })
                )
            );

            skjema.felter.målform.validerOgSettFelt(
                åpenBehandling.søknadsgrunnlag.søkerMedOpplysninger.målform
            );
            skjema.felter.endringAvOpplysningerBegrunnelse.validerOgSettFelt(
                åpenBehandling.søknadsgrunnlag.endringAvOpplysningerBegrunnelse
            );
        } else {
            // Ny behandling er lastet som ikke har fullført søknad-steget.
            tilbakestillSøknad();
        }
    }, [åpenBehandling]);

    const nesteAction = (bekreftEndringerViaFrontend: boolean) => {
        if (bruker.status === RessursStatus.SUKSESS) {
            if (vurderErLesevisning()) {
                navigate(`/fagsak/${fagsakId}/${åpenBehandling?.behandlingId}/vilkaarsvurdering`);
            } else {
                onSubmit<IRestRegistrerSøknad>(
                    {
                        method: 'POST',
                        data: {
                            søknad: {
                                søkerMedOpplysninger: {
                                    ident: bruker.data.personIdent,
                                    målform: skjema.felter.målform.verdi,
                                },
                                barnaMedOpplysninger: skjema.felter.barnaMedOpplysninger.verdi.map(
                                    (barn: IBarnMedOpplysninger): IBarnMedOpplysningerBackend => ({
                                        ...barn,
                                        inkludertISøknaden: barn.merket,
                                        ident: barn.ident ?? '',
                                    })
                                ),
                                endringAvOpplysningerBegrunnelse:
                                    skjema.felter.endringAvOpplysningerBegrunnelse.verdi,
                            },
                            bekreftEndringerViaFrontend,
                        },
                        url: `/familie-ks-sak/api/behandlinger/${åpenBehandling.behandlingId}/steg/registrer-søknad`,
                    },
                    (response: Ressurs<IBehandling>) => {
                        if (response.status === RessursStatus.SUKSESS) {
                            settÅpenBehandling(response);
                            navigate(
                                `/fagsak/${fagsakId}/${åpenBehandling.behandlingId}/vilkaarsvurdering`
                            );
                        }
                    }
                );
            }
        }
    };

    return (
        <SøknadContext.Provider
            value={{
                barnMedLøpendeUtbetaling,
                hentFeilTilOppsummering,
                nesteAction,
                skjema,
                søknadErLastetFraBackend,
            }}
        >
            {children}
        </SøknadContext.Provider>
    );
};

export const useSøknadContext = () => {
    const context = useContext(SøknadContext);

    if (context === undefined) {
        throw new Error('useSøknadContext må brukes innenfor en SøknadProvider');
    }

    return context;
};
