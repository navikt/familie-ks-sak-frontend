import { useEffect, useState } from 'react';

import { FormProvider } from 'react-hook-form';

import { Table } from '@navikt/ds-react';

import {
    useUtenlandskPeriodeBeløpSkjema,
    utenlandskPeriodeBeløpFeilmeldingId,
} from './useUtenlandskPeriodeBeløpSkjema';
import UtenlandskPeriodeBeløpTabellRadEndre from './UtenlandskPeriodeBeløpTabellRadEndre';
import type { IBehandling } from '../../../../../../../typer/behandling';
import type { OptionType } from '../../../../../../../typer/common';
import type { IRestUtenlandskPeriodeBeløp } from '../../../../../../../typer/eøsPerioder';
import { lagPersonLabel } from '../../../../../../../utils/formatter';
import { StatusBarnCelleOgPeriodeCelle } from '../EøsKomponenter/EøsSkjemaKomponenter';

interface IProps {
    utenlandskPeriodeBeløp: IRestUtenlandskPeriodeBeløp;
    åpenBehandling: IBehandling;
    visFeilmeldinger: boolean;
}

const UtenlandskPeriodeBeløpRad = ({ utenlandskPeriodeBeløp, åpenBehandling, visFeilmeldinger }: IProps) => {
    const [erUtenlandskPeriodeBeløpEkspandert, settErUtenlandskPeriodeBeløpEkspandert] = useState(false);

    const barn: OptionType[] = utenlandskPeriodeBeløp.barnIdenter.map(barn => ({
        value: barn,
        label: lagPersonLabel(barn, åpenBehandling.personer),
    }));

    const {
        form,
        onSubmit,
        slettUtenlandskPeriodeBeløp,
        sletterUtenlandskPeriodeBeløp,
        initiellFom,
        behandlingsÅrsakErOvergangsordning,
    } = useUtenlandskPeriodeBeløpSkjema({
        utenlandskPeriodeBeløp,
        barnIUtenlandskPeriodeBeløp: barn,
        lukkSkjema: () => settErUtenlandskPeriodeBeløpEkspandert(false),
    });

    useEffect(() => {
        if (visFeilmeldinger && erUtenlandskPeriodeBeløpEkspandert) {
            form.trigger();
        }
    }, [visFeilmeldinger, erUtenlandskPeriodeBeløpEkspandert]);

    const toggleForm = (visAlert: boolean) => {
        if (erUtenlandskPeriodeBeløpEkspandert && visAlert && form.formState.isDirty) {
            alert('Utenlandsk beløp har endringer som ikke er lagret!');
        } else {
            settErUtenlandskPeriodeBeløpEkspandert(!erUtenlandskPeriodeBeløpEkspandert);
            form.reset();
        }
    };

    const formatterKalkulertBeløp = () => {
        const beløp = Number(utenlandskPeriodeBeløp.kalkulertMånedligBeløp);
        const formatter = Intl.NumberFormat('no-NB', {
            maximumFractionDigits: 2,
        });
        return formatter.format(beløp);
    };

    return (
        <Table.ExpandableRow
            open={erUtenlandskPeriodeBeløpEkspandert}
            togglePlacement="right"
            onOpenChange={() => toggleForm(true)}
            id={utenlandskPeriodeBeløpFeilmeldingId(utenlandskPeriodeBeløp)}
            content={
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <UtenlandskPeriodeBeløpTabellRadEndre
                            utenlandskPeriodeBeløp={utenlandskPeriodeBeløp}
                            tilgjengeligeBarn={barn}
                            initiellFom={initiellFom}
                            behandlingsÅrsakErOvergangsordning={behandlingsÅrsakErOvergangsordning}
                            onAvbryt={() => toggleForm(false)}
                            slettUtenlandskPeriodeBeløp={slettUtenlandskPeriodeBeløp}
                            sletterUtenlandskPeriodeBeløp={sletterUtenlandskPeriodeBeløp}
                        />
                    </form>
                </FormProvider>
            }
        >
            <StatusBarnCelleOgPeriodeCelle
                status={utenlandskPeriodeBeløp.status}
                barnIdenter={utenlandskPeriodeBeløp.barnIdenter}
                personer={åpenBehandling.personer}
                periode={{
                    fom: utenlandskPeriodeBeløp.fom,
                    tom: utenlandskPeriodeBeløp.tom,
                }}
            />
            <Table.DataCell>
                {utenlandskPeriodeBeløp.kalkulertMånedligBeløp ? formatterKalkulertBeløp() : '-'}
            </Table.DataCell>
            <Table.DataCell>
                {utenlandskPeriodeBeløp.valutakode ? utenlandskPeriodeBeløp.valutakode : '-'}
            </Table.DataCell>
        </Table.ExpandableRow>
    );
};

export default UtenlandskPeriodeBeløpRad;
