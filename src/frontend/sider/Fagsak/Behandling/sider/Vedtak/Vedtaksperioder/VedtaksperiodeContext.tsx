import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import deepEqual from 'deep-equal';

import type { ActionMeta, GroupBase, OptionType } from '@navikt/familie-form-elements';
import { useHttp } from '@navikt/familie-http';
import type { FeiloppsummeringFeil, FeltState, ISkjema } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema, Valideringsstatus } from '@navikt/familie-skjema';
import type { Ressurs } from '@navikt/familie-typer';
import { byggFeiletRessurs, byggHenterRessurs, byggTomRessurs, RessursStatus } from '@navikt/familie-typer';

import { grupperteBegrunnelser } from './utils';
import { useVedtakBegrunnelser } from './VedtakBegrunnelserContext';
import { HentGenererteBrevbegrunnelserQueryKeyFactory } from '../../../../../../hooks/useHentGenererteBrevbegrunnelser';
import { Behandlingstype, type IBehandling } from '../../../../../../typer/behandling';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import type {
    IRestPutVedtaksperiodeMedFritekster,
    IVedtaksperiodeMedBegrunnelser,
} from '../../../../../../typer/vedtaksperiode';
import type { IIsoDatoPeriode } from '../../../../../../utils/dato';
import {
    genererIdBasertPåAndreFritekster,
    type IFritekstFelt,
    lagInitiellFritekst,
} from '../../../../../../utils/fritekstfelter';
import { useBehandlingContext } from '../../../context/BehandlingContext';

interface IProps extends PropsWithChildren {
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
    åpenBehandling: IBehandling;
}

interface BegrunnelserSkjema {
    periode: IIsoDatoPeriode;
    fritekster: FeltState<IFritekstFelt>[];
}

interface VedtaksperiodeContextValue {
    erPanelEkspandert: boolean;
    grupperteBegrunnelser: GroupBase<OptionType>[];
    hentFeilTilOppsummering: () => FeiloppsummeringFeil[];
    id: number;
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
    leggTilFritekst: () => void;
    maksAntallKulepunkter: number;
    makslengdeFritekst: number;
    onChangeBegrunnelse: (action: ActionMeta<OptionType>) => void;
    onPanelClose: (visAlert: boolean) => void;
    putVedtaksperiodeMedFritekster: () => void;
    skjema: ISkjema<BegrunnelserSkjema, IBehandling>;
    åpenBehandling: IBehandling;
    begrunnelserPut: Ressurs<unknown>;
}

const VedtaksperiodeContext = createContext<VedtaksperiodeContextValue | undefined>(undefined);

export const VedtaksperiodeProvider = ({ åpenBehandling, vedtaksperiodeMedBegrunnelser, children }: IProps) => {
    const { request } = useHttp();
    const { settÅpenBehandling } = useBehandlingContext();
    const queryClient = useQueryClient();
    const [erPanelEkspandert, settErPanelEkspandert] = useState(
        åpenBehandling.type === Behandlingstype.FØRSTEGANGSBEHANDLING &&
            vedtaksperiodeMedBegrunnelser.begrunnelser.length === 0 &&
            vedtaksperiodeMedBegrunnelser.fritekster.length === 0
    );
    const [begrunnelserPut, settBegrunnelserPut] = useState(byggTomRessurs());

    const maksAntallKulepunkter = 3;
    const makslengdeFritekst = 350;

    const alleBegrunnelser = [
        ...vedtaksperiodeMedBegrunnelser.begrunnelser,
        ...vedtaksperiodeMedBegrunnelser.eøsBegrunnelser,
    ];

    const periode = useFelt<IIsoDatoPeriode>({
        verdi: {
            fom: vedtaksperiodeMedBegrunnelser.fom,
            tom: vedtaksperiodeMedBegrunnelser.tom,
        },
    });

    const fritekster = useFelt<FeltState<IFritekstFelt>[]>({
        verdi: [],
        valideringsfunksjon: (felt: FeltState<FeltState<IFritekstFelt>[]>) => {
            return felt.verdi.some(
                fritekst => fritekst.valideringsstatus === Valideringsstatus.FEIL || fritekst.verdi.tekst.length === 0
            )
                ? feil(felt, '')
                : ok(felt);
        },
    });

    const { hentFeilTilOppsummering, kanSendeSkjema, onSubmit, settVisfeilmeldinger, skjema } = useSkjema<
        {
            periode: IIsoDatoPeriode;
            fritekster: FeltState<IFritekstFelt>[];
        },
        IBehandling
    >({
        felter: {
            periode,
            fritekster,
        },
        skjemanavn: 'Begrunnelser for vedtaksperiode',
    });

    const { alleBegrunnelserRessurs } = useVedtakBegrunnelser();

    const populerSkjemaFraBackend = () => {
        settVisfeilmeldinger(false);
        skjema.felter.periode.validerOgSettFelt({
            fom: vedtaksperiodeMedBegrunnelser.fom,
            tom: vedtaksperiodeMedBegrunnelser.tom,
        });

        skjema.felter.fritekster.validerOgSettFelt(
            vedtaksperiodeMedBegrunnelser.fritekster.map((fritekst, id) =>
                lagInitiellFritekst(fritekst, id, makslengdeFritekst)
            )
        );
    };

    useEffect(() => {
        if (alleBegrunnelserRessurs.status === RessursStatus.SUKSESS) {
            populerSkjemaFraBackend();
            queryClient.invalidateQueries({
                queryKey: HentGenererteBrevbegrunnelserQueryKeyFactory.vedtaksperiode(vedtaksperiodeMedBegrunnelser.id),
            });
        }
    }, [alleBegrunnelserRessurs, vedtaksperiodeMedBegrunnelser]);

    const onChangeBegrunnelse = (action: ActionMeta<OptionType>) => {
        switch (action.action) {
            case 'select-option':
                if (action.option) {
                    oppdaterBegrunnelser([
                        ...alleBegrunnelser.map(vedtaksBegrunnelse => vedtaksBegrunnelse.begrunnelse),
                        action.option?.value as Begrunnelse,
                    ]);
                }
                break;
            case 'pop-value':
            case 'remove-value':
                if (action.removedValue) {
                    oppdaterBegrunnelser(
                        [
                            ...alleBegrunnelser.filter(
                                persistertBegrunnelse =>
                                    persistertBegrunnelse.begrunnelse !== (action.removedValue?.value as Begrunnelse)
                            ),
                        ].map(vedtaksBegrunnelse => vedtaksBegrunnelse.begrunnelse)
                    );
                }

                break;
            case 'clear':
                oppdaterBegrunnelser([]);
                break;
            default:
                throw new Error('Ukjent action ved onChange på vedtakbegrunnelser');
        }
    };

    const oppdaterBegrunnelser = (begrunnelser: Begrunnelse[]) => {
        settBegrunnelserPut(byggHenterRessurs());
        request<{ begrunnelser: Begrunnelse[] }, IBehandling>({
            method: 'PUT',
            url: `/familie-ks-sak/api/vedtaksperioder/begrunnelser/${vedtaksperiodeMedBegrunnelser.id}`,
            data: { begrunnelser },
        }).then((behandling: Ressurs<IBehandling>) => {
            if (behandling.status === RessursStatus.SUKSESS) {
                settÅpenBehandling(behandling);
                settBegrunnelserPut(byggTomRessurs());
            } else if (behandling.status === RessursStatus.FUNKSJONELL_FEIL) {
                settBegrunnelserPut(byggFeiletRessurs(behandling.frontendFeilmelding));
            } else {
                settBegrunnelserPut(byggFeiletRessurs('Klarte ikke oppdatere begrunnelser'));
            }
        });
    };

    const leggTilFritekst = () => {
        skjema.felter.fritekster.validerOgSettFelt([
            ...skjema.felter.fritekster.verdi,
            lagInitiellFritekst('', genererIdBasertPåAndreFritekster(skjema.felter.fritekster), makslengdeFritekst),
        ]);
    };

    const onPanelClose = (visAlert: boolean) => {
        if (
            erPanelEkspandert &&
            visAlert &&
            !deepEqual(
                skjema.felter.fritekster.verdi.map(fritekst => fritekst.verdi.tekst),
                vedtaksperiodeMedBegrunnelser.fritekster
            )
        ) {
            alert('Periode har endringer som ikke er lagret!');
        } else {
            settErPanelEkspandert(!erPanelEkspandert);
            populerSkjemaFraBackend();
        }
    };

    const putVedtaksperiodeMedFritekster = () => {
        if (kanSendeSkjema()) {
            onSubmit<IRestPutVedtaksperiodeMedFritekster>(
                {
                    method: 'PUT',
                    url: `/familie-ks-sak/api/vedtaksperioder/fritekster/${vedtaksperiodeMedBegrunnelser.id}`,
                    data: {
                        fritekster: skjema.felter.fritekster.verdi.map(fritekst => fritekst.verdi.tekst),
                    },
                },
                (behandling: Ressurs<IBehandling>) => {
                    settÅpenBehandling(behandling);
                    onPanelClose(false);
                }
            );
        }
    };

    return (
        <VedtaksperiodeContext.Provider
            value={{
                erPanelEkspandert,
                grupperteBegrunnelser: grupperteBegrunnelser(vedtaksperiodeMedBegrunnelser, alleBegrunnelserRessurs),
                hentFeilTilOppsummering,
                id: vedtaksperiodeMedBegrunnelser.id,
                vedtaksperiodeMedBegrunnelser,
                leggTilFritekst,
                maksAntallKulepunkter,
                makslengdeFritekst,
                onChangeBegrunnelse,
                onPanelClose,
                putVedtaksperiodeMedFritekster,
                skjema,
                åpenBehandling,
                begrunnelserPut,
            }}
        >
            {children}
        </VedtaksperiodeContext.Provider>
    );
};

export const useVedtaksperiodeContext = () => {
    const context = useContext(VedtaksperiodeContext);

    if (context === undefined) {
        throw new Error('useVedtaksperiodeContext må brukes inne i en VedtaksperiodeProvider');
    }
    return context;
};
