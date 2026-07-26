import { useOnFormSubmitSuccessful } from '@hooks/useOnFormSubmitSuccessful';
import { useOppdaterUtenlandskPeriodeBeløp } from '@hooks/useOppdaterUtenlandskPeriodeBeløp';
import { useSlettUtenlandskPeriodeBeløp } from '@hooks/useSlettUtenlandskPeriodeBeløp';
import type { OptionType } from '@typer/common';
import type { IRestUtenlandskPeriodeBeløp, UtenlandskPeriodeBeløpIntervall } from '@typer/eøsPerioder';
import { type IIsoMånedPeriode, nyIsoMånedPeriode } from '@utils/dato';
import { useForm } from 'react-hook-form';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { BehandlingÅrsak } from '../../../../../../../typer/behandling';
import { useBehandlingContext } from '../../../../context/BehandlingContext';
import { konverterDesimalverdiTilSkjemaVisning, konverterSkjemaverdiTilDesimal } from '../utils';

export enum UtenlandskPeriodeBeløpFelt {
    BARN = 'barnIdenter',
    PERIODE = 'periode',
    BELØP = 'beløp',
    VALUTAKODE = 'valutakode',
    INTERVALL = 'intervall',
}

export interface UtenlandskPeriodeBeløpFormValues {
    [UtenlandskPeriodeBeløpFelt.BARN]: OptionType[];
    [UtenlandskPeriodeBeløpFelt.PERIODE]: IIsoMånedPeriode;
    [UtenlandskPeriodeBeløpFelt.BELØP]: string | undefined;
    [UtenlandskPeriodeBeløpFelt.VALUTAKODE]: string | undefined;
    [UtenlandskPeriodeBeløpFelt.INTERVALL]: UtenlandskPeriodeBeløpIntervall | undefined;
}

export const utenlandskPeriodeBeløpFeilmeldingId = (utenlandskPeriodeBeløp: IRestUtenlandskPeriodeBeløp): string =>
    `utd_beløp_${utenlandskPeriodeBeløp.barnIdenter.map(barn => `${barn}-`)}_${utenlandskPeriodeBeløp.fom}`;

interface Props {
    utenlandskPeriodeBeløp: IRestUtenlandskPeriodeBeløp;
    barnIUtenlandskPeriodeBeløp: OptionType[];
    lukkSkjema: () => void;
}

export const useUtenlandskPeriodeBeløpSkjema = ({
    utenlandskPeriodeBeløp,
    barnIUtenlandskPeriodeBeløp,
    lukkSkjema,
}: Props) => {
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const behandlingsÅrsakErOvergangsordning = behandling.årsak === BehandlingÅrsak.OVERGANGSORDNING_2024;

    const { mutateAsync: oppdaterUtenlandskPeriodeBeløp } = useOppdaterUtenlandskPeriodeBeløp();
    const { mutateAsync: slettUtenlandskPeriodeBeløpMutate, isPending: sletterUtenlandskPeriodeBeløp } =
        useSlettUtenlandskPeriodeBeløp();

    const form = useForm<UtenlandskPeriodeBeløpFormValues>({
        values: {
            [UtenlandskPeriodeBeløpFelt.BARN]: barnIUtenlandskPeriodeBeløp,
            [UtenlandskPeriodeBeløpFelt.PERIODE]: nyIsoMånedPeriode(
                utenlandskPeriodeBeløp.fom,
                utenlandskPeriodeBeløp.tom
            ),
            [UtenlandskPeriodeBeløpFelt.BELØP]: konverterDesimalverdiTilSkjemaVisning(utenlandskPeriodeBeløp.beløp),
            [UtenlandskPeriodeBeløpFelt.VALUTAKODE]: utenlandskPeriodeBeløp.valutakode,
            [UtenlandskPeriodeBeløpFelt.INTERVALL]: utenlandskPeriodeBeløp.intervall,
        },
    });

    const { control, setError, reset } = form;

    useOnFormSubmitSuccessful(control, () => reset());

    const onSubmit = async (values: UtenlandskPeriodeBeløpFormValues) => {
        try {
            const oppdatertBehandling = await oppdaterUtenlandskPeriodeBeløp({
                behandlingId: behandling.behandlingId,
                id: utenlandskPeriodeBeløp.id,
                fom: values.periode.fom ?? '',
                tom: values.periode.tom,
                barnIdenter: values.barnIdenter.map(barn => barn.value),
                beløp: konverterSkjemaverdiTilDesimal(values.beløp) ?? '',
                valutakode: values.valutakode,
                intervall: values.intervall,
            });
            settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
            lukkSkjema();
        } catch (error) {
            setError('root', {
                message:
                    error instanceof Error ? error.message : 'Teknisk feil ved lagring av utenlandsk periodebeløp.',
            });
        }
    };

    const slettUtenlandskPeriodeBeløp = async () => {
        try {
            const oppdatertBehandling = await slettUtenlandskPeriodeBeløpMutate({
                behandlingId: behandling.behandlingId,
                utenlandskPeriodeBeløpId: utenlandskPeriodeBeløp.id,
            });
            settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
            lukkSkjema();
        } catch (error) {
            setError('root', {
                message:
                    error instanceof Error ? error.message : 'Teknisk feil ved sletting av utenlandsk periodebeløp.',
            });
        }
    };

    return {
        form,
        onSubmit,
        slettUtenlandskPeriodeBeløp,
        sletterUtenlandskPeriodeBeløp,
        initiellFom: utenlandskPeriodeBeløp.fom,
        behandlingsÅrsakErOvergangsordning,
    };
};
