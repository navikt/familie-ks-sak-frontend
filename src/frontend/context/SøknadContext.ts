import React from 'react';

import createUseContext from 'constate';
import { isAfter } from 'date-fns';
import { useNavigate } from 'react-router';

import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import type { Avhengigheter } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { useBehandling } from './behandlingContext/BehandlingContext';
import { useFagsakContext } from './fagsak/FagsakContext';
import useSakOgBehandlingParams from '../hooks/useSakOgBehandlingParams';
import type { IBehandling } from '../typer/behandling';
import type { IMinimalFagsak } from '../typer/fagsak';
import type { IForelderBarnRelasjon } from '../typer/person';
import { ForelderBarnRelasjonRolle } from '../typer/person';
import type {
    IBarnMedOpplysninger,
    IBarnMedOpplysningerBackend,
    IRestRegistrerSøknad,
    Målform,
} from '../typer/søknad';
import { dagensDato, isoStringTilDateMedFallback, tidenesEnde } from '../utils/dato';

export const hentBarnMedLøpendeUtbetaling = (minimalFagsak: IMinimalFagsak) =>
    minimalFagsak.gjeldendeUtbetalingsperioder
        .filter(utbetalingsperiode =>
            isAfter(
                isoStringTilDateMedFallback({
                    isoString: utbetalingsperiode.periodeTom,
                    fallbackDate: tidenesEnde,
                }),
                dagensDato
            )
        )
        .reduce((acc, utbetalingsperiode) => {
            utbetalingsperiode.utbetalingsperiodeDetaljer.map(utbetalingsperiodeDetalj =>
                acc.add(utbetalingsperiodeDetalj.person.personIdent)
            );

            return acc;
        }, new Set());

const [SøknadProvider, useSøknad] = createUseContext(
    ({ åpenBehandling }: { åpenBehandling: IBehandling }) => {
        const { vurderErLesevisning, settÅpenBehandling } = useBehandling();
        const { fagsakId } = useSakOgBehandlingParams();
        const navigate = useNavigate();
        const { bruker, minimalFagsakRessurs } = useFagsakContext();
        const [visBekreftModal, settVisBekreftModal] = React.useState<boolean>(false);

        const barnMedLøpendeUtbetaling =
            minimalFagsakRessurs.status === RessursStatus.SUKSESS
                ? hentBarnMedLøpendeUtbetaling(minimalFagsakRessurs.data)
                : new Set();

        const { skjema, nullstillSkjema, onSubmit, hentFeilTilOppsummering } = useSkjema<
            {
                barnaMedOpplysninger: IBarnMedOpplysninger[];
                endringAvOpplysningerBegrunnelse: string;
                målform: Målform | undefined;
            },
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
                    navigate(
                        `/fagsak/${fagsakId}/${åpenBehandling?.behandlingId}/vilkaarsvurdering`
                    );
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
                                    barnaMedOpplysninger:
                                        skjema.felter.barnaMedOpplysninger.verdi.map(
                                            (
                                                barn: IBarnMedOpplysninger
                                            ): IBarnMedOpplysningerBackend => ({
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
                        },
                        (errorResponse: Ressurs<IBehandling>) => {
                            if (errorResponse.status === RessursStatus.FUNKSJONELL_FEIL) {
                                settVisBekreftModal(true);
                            }
                        }
                    );
                }
            }
        };

        return {
            barnMedLøpendeUtbetaling,
            hentFeilTilOppsummering,
            nesteAction,
            settVisBekreftModal,
            skjema,
            søknadErLastetFraBackend,
            visBekreftModal,
        };
    }
);

export { SøknadProvider, useSøknad };
