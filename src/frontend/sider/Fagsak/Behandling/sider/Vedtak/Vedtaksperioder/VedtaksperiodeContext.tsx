import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import deepEqual from 'deep-equal';

import type { GroupBase, OptionType } from '@navikt/familie-form-elements';
import type { FeiloppsummeringFeil, FeltState, ISkjema } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema, Valideringsstatus } from '@navikt/familie-skjema';
import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useAlleBegrunnelserContext } from './AlleBegrunnelserContext';
import { grupperteBegrunnelser } from './utils';
import { HentGenererteBrevbegrunnelserQueryKeyFactory } from '../../../../../../hooks/useHentGenererteBrevbegrunnelser';
import { useOppdaterBegrunnelser } from '../../../../../../hooks/useOppdaterBegrunnelser';
import { useOppdaterVedtaksperiodeMedFritekster } from '../../../../../../hooks/useOppdaterVedtaksperiodeMedFritekster';
import { Behandlingstype, type IBehandling } from '../../../../../../typer/behandling';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '../../../../../../typer/vedtaksperiode';
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
    onChangeBegrunnelse: (option: string, isSelected: boolean) => void;
    onPanelClose: (visAlert: boolean) => void;
    putVedtaksperiodeMedFritekster: () => void;
    skjema: ISkjema<BegrunnelserSkjema, IBehandling>;
    åpenBehandling: IBehandling;
}

const VedtaksperiodeContext = createContext<VedtaksperiodeContextValue | undefined>(undefined);

export const VedtaksperiodeProvider = ({ åpenBehandling, vedtaksperiodeMedBegrunnelser, children }: IProps) => {
    const { settÅpenBehandling } = useBehandlingContext();
    const queryClient = useQueryClient();
    const [erPanelEkspandert, settErPanelEkspandert] = useState(
        åpenBehandling.type === Behandlingstype.FØRSTEGANGSBEHANDLING &&
            vedtaksperiodeMedBegrunnelser.begrunnelser.length === 0 &&
            vedtaksperiodeMedBegrunnelser.fritekster.length === 0
    );

    const { mutate: oppdaterBegrunnelser } = useOppdaterBegrunnelser(vedtaksperiodeMedBegrunnelser.id, {
        onSuccess: behandling => {
            settÅpenBehandling(byggSuksessRessurs(behandling));
            queryClient.invalidateQueries({
                queryKey: HentGenererteBrevbegrunnelserQueryKeyFactory.vedtaksperiode(vedtaksperiodeMedBegrunnelser.id),
            });
        },
    });

    const { mutate: oppdaterVedtaksperiodeMedFritekster } = useOppdaterVedtaksperiodeMedFritekster(
        vedtaksperiodeMedBegrunnelser.id,
        {
            onSuccess: (behandling: IBehandling) => {
                settÅpenBehandling(byggSuksessRessurs(behandling));
                queryClient.invalidateQueries({
                    queryKey: HentGenererteBrevbegrunnelserQueryKeyFactory.vedtaksperiode(
                        vedtaksperiodeMedBegrunnelser.id
                    ),
                });
                onPanelClose(false);
            },
        }
    );

    const maksAntallKulepunkter = 3;
    const makslengdeFritekst = 350;

    const valgteBegrunnelser = [
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

    const { hentFeilTilOppsummering, kanSendeSkjema, settVisfeilmeldinger, skjema } = useSkjema<
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

    const { alleBegrunnelser } = useAlleBegrunnelserContext();

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
        populerSkjemaFraBackend();
    }, [vedtaksperiodeMedBegrunnelser]);

    const onChangeBegrunnelse = (option: string, isSelected: boolean) => {
        if (isSelected) {
            oppdaterBegrunnelser({
                begrunnelser: [
                    ...valgteBegrunnelser.map(vedtaksBegrunnelse => vedtaksBegrunnelse.begrunnelse),
                    option as Begrunnelse,
                ],
            });
        } else {
            oppdaterBegrunnelser({
                begrunnelser: [
                    ...valgteBegrunnelser.filter(
                        persistertBegrunnelse => persistertBegrunnelse.begrunnelse !== (option as Begrunnelse)
                    ),
                ].map(vedtaksBegrunnelse => vedtaksBegrunnelse.begrunnelse),
            });
        }
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
            oppdaterVedtaksperiodeMedFritekster({
                fritekster: skjema.felter.fritekster.verdi.map(fritekst => fritekst.verdi.tekst),
            });
        }
    };

    return (
        <VedtaksperiodeContext.Provider
            value={{
                erPanelEkspandert,
                grupperteBegrunnelser: grupperteBegrunnelser(vedtaksperiodeMedBegrunnelser, alleBegrunnelser),
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
