import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { HentGenererteBrevbegrunnelserQueryKeyFactory } from '@hooks/useHentGenererteBrevbegrunnelser';
import { useOppdaterBegrunnelser } from '@hooks/useOppdaterBegrunnelser';
import { MAKS_LENGDE_FRITEKST } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/Fritekstbegrunnelser';
import { useQueryClient } from '@tanstack/react-query';
import { Behandlingstype, type IBehandling } from '@typer/behandling';
import type { Begrunnelse } from '@typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import type { IIsoDatoPeriode } from '@utils/dato';
import { type IFritekstFelt, lagInitiellFritekst } from '@utils/fritekstfelter';
import deepEqual from 'deep-equal';

import type { ActionMeta, GroupBase, OptionType } from '@navikt/familie-form-elements';
import type { FeltState, ISkjema } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema, Valideringsstatus } from '@navikt/familie-skjema';
import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useAlleBegrunnelserContext } from './AlleBegrunnelserContext';
import { grupperteBegrunnelser } from './utils';
import { useBehandlingContext } from '../../../context/BehandlingContext';

interface Props extends PropsWithChildren {
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
}

interface BegrunnelserSkjema {
    periode: IIsoDatoPeriode;
    fritekster: FeltState<IFritekstFelt>[];
}

interface VedtaksperiodeContextValue {
    erPanelEkspandert: boolean;
    grupperteBegrunnelser: GroupBase<OptionType>[];
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
    onChangeBegrunnelse: (action: ActionMeta<OptionType>) => void;
    onPanelClose: (visAlert: boolean) => void;
    skjema: ISkjema<BegrunnelserSkjema, IBehandling>;
    kanSendeSkjema: () => boolean;
}

const VedtaksperiodeContext = createContext<VedtaksperiodeContextValue | undefined>(undefined);

export function VedtaksperiodeProvider({ vedtaksperiodeMedBegrunnelser, children }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const queryClient = useQueryClient();

    const [erPanelEkspandert, settErPanelEkspandert] = useState(
        behandling.type === Behandlingstype.FØRSTEGANGSBEHANDLING &&
            vedtaksperiodeMedBegrunnelser.begrunnelser.length === 0 &&
            vedtaksperiodeMedBegrunnelser.fritekster.length === 0
    );

    const { mutate: oppdaterBegrunnelser } = useOppdaterBegrunnelser(vedtaksperiodeMedBegrunnelser.id, {
        onSuccess: async behandling => {
            await queryClient.invalidateQueries({
                queryKey: HentGenererteBrevbegrunnelserQueryKeyFactory.vedtaksperiode(vedtaksperiodeMedBegrunnelser.id),
            });
            settÅpenBehandling(byggSuksessRessurs(behandling));
        },
    });

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

    const { kanSendeSkjema, settVisfeilmeldinger, skjema } = useSkjema<
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
                lagInitiellFritekst(fritekst, id, MAKS_LENGDE_FRITEKST)
            )
        );
    };

    useEffect(() => {
        populerSkjemaFraBackend();
    }, [vedtaksperiodeMedBegrunnelser]);

    const onChangeBegrunnelse = (action: ActionMeta<OptionType>) => {
        switch (action.action) {
            case 'select-option':
                if (action.option) {
                    oppdaterBegrunnelser({
                        begrunnelser: [
                            ...valgteBegrunnelser.map(vedtaksBegrunnelse => vedtaksBegrunnelse.begrunnelse),
                            action.option?.value as Begrunnelse,
                        ],
                    });
                }
                break;
            case 'pop-value':
            case 'remove-value':
                if (action.removedValue) {
                    oppdaterBegrunnelser({
                        begrunnelser: [
                            ...valgteBegrunnelser.filter(
                                persistertBegrunnelse =>
                                    persistertBegrunnelse.begrunnelse !== (action.removedValue?.value as Begrunnelse)
                            ),
                        ].map(vedtaksBegrunnelse => vedtaksBegrunnelse.begrunnelse),
                    });
                }

                break;
            case 'clear':
                oppdaterBegrunnelser({ begrunnelser: [] });
                break;
            default:
                throw new Error('Ukjent action ved onChange på vedtakbegrunnelser');
        }
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

    return (
        <VedtaksperiodeContext.Provider
            value={{
                erPanelEkspandert,
                grupperteBegrunnelser: grupperteBegrunnelser(vedtaksperiodeMedBegrunnelser, alleBegrunnelser),
                vedtaksperiodeMedBegrunnelser,
                onChangeBegrunnelse,
                onPanelClose,
                skjema,
                kanSendeSkjema,
            }}
        >
            {children}
        </VedtaksperiodeContext.Provider>
    );
}

export function useVedtaksperiodeContext() {
    const context = useContext(VedtaksperiodeContext);
    if (context === undefined) {
        throw new Error('useVedtaksperiodeContext må brukes inne i en VedtaksperiodeProvider');
    }
    return context;
}
