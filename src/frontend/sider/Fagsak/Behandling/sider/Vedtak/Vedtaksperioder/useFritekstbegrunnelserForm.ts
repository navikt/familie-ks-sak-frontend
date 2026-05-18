import { useEffect, useRef } from 'react';

import { useConfirmBrowserRefresh } from '@hooks/useConfirmBrowserRefresh';
import { HentGenererteBrevbegrunnelserQueryKeyFactory } from '@hooks/useHentGenererteBrevbegrunnelser';
import { useOnFormSubmitSuccessful } from '@hooks/useOnFormSubmitSuccessful';
import { useOppdaterVedtaksperiodeMedFritekster } from '@hooks/useOppdaterVedtaksperiodeMedFritekster';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { MAKS_LENGDE_FRITEKST } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/Fritekstbegrunnelser';
import { useVedtaksperiodeContext } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/VedtaksperiodeContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';

import { byggSuksessRessurs } from '@navikt/familie-typer';

const NY_FRITEKSTBEGRUNNELSE = { value: '' };

interface Fritekstbegrunnelse {
    value: string;
}

export enum Field {
    FRITEKSTBEGRUNNELSER = 'fritekstbegrunnelser',
}

export interface FormValues {
    [Field.FRITEKSTBEGRUNNELSER]: Fritekstbegrunnelse[];
}

export function useFritekstbegrunnelserForm() {
    const { vedtaksperiodeMedBegrunnelser, settErSkjemaendringer } = useVedtaksperiodeContext();
    const { settÅpenBehandling } = useBehandlingContext();

    const queryClient = useQueryClient();
    const submittedFieldsRef = useRef<Set<string>>(new Set());

    const form = useForm<FormValues>({
        values: {
            [Field.FRITEKSTBEGRUNNELSER]: vedtaksperiodeMedBegrunnelser.fritekster.map(fritekst => ({
                value: fritekst,
            })),
        },
    });

    const {
        control,
        setError,
        clearErrors,
        formState: { isDirty },
        reset,
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: Field.FRITEKSTBEGRUNNELSER,
    });

    useEffect(() => {
        settErSkjemaendringer(isDirty);
    }, [settErSkjemaendringer, isDirty]);

    useConfirmBrowserRefresh({ enabled: isDirty });

    useOnFormSubmitSuccessful(control, () => reset());

    const { mutateAsync: oppdaterVedtaksperiodeMedFritekster } = useOppdaterVedtaksperiodeMedFritekster(
        vedtaksperiodeMedBegrunnelser.id,
        {
            onSuccess: async behandling => {
                await queryClient.invalidateQueries({
                    queryKey: HentGenererteBrevbegrunnelserQueryKeyFactory.vedtaksperiode(
                        vedtaksperiodeMedBegrunnelser.id
                    ),
                });
                settÅpenBehandling(byggSuksessRessurs(behandling));
            },
            onError: error => setError('root', { message: error.message ?? 'En ukjent feil oppstod.' }),
        }
    );

    function leggTilFritekstbegrunnelse() {
        clearErrors('root');
        append(NY_FRITEKSTBEGRUNNELSE);
    }

    function slettFritekstbegrunnelse(index: number) {
        clearErrors('root');
        remove(index);
    }

    function validerBegrunnelse(fieldId: string, value: string) {
        if (!submittedFieldsRef.current.has(fieldId)) {
            return true;
        }
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Friktest må fylles ut eller fjernes.';
        }
        if (trimmed.length < 3) {
            return 'Minst tre tegn er påkrevd.';
        }
        if (trimmed.length > MAKS_LENGDE_FRITEKST) {
            return `Kan ikke overstige ${MAKS_LENGDE_FRITEKST} tegn.`;
        }
        return true;
    }

    function onSubmit({ fritekstbegrunnelser }: FormValues) {
        const fritekster = fritekstbegrunnelser.map(fritekstbegrunnelse => fritekstbegrunnelse.value);
        return oppdaterVedtaksperiodeMedFritekster({ fritekster });
    }

    return {
        form,
        fields,
        onSubmit,
        submittedFieldsRef,
        leggTilFritekstbegrunnelse,
        slettFritekstbegrunnelse,
        validerBegrunnelse,
    };
}
