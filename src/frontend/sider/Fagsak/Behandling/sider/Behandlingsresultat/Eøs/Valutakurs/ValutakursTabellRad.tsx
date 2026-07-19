import { useEffect, useState } from 'react';

import { FormProvider } from 'react-hook-form';

import { Table } from '@navikt/ds-react';

import { useValutakursSkjema, valutakursFeilmeldingId } from './useValutakursSkjema';
import ValutakursTabellRadEndre from './ValutakursTabellRadEndre';
import type { IBehandling } from '../../../../../../../typer/behandling';
import type { OptionType } from '../../../../../../../typer/common';
import type { IRestValutakurs } from '../../../../../../../typer/eøsPerioder';
import { Datoformat, isoStringTilFormatertString } from '../../../../../../../utils/dato';
import { lagPersonLabel } from '../../../../../../../utils/formatter';
import { StatusBarnCelleOgPeriodeCelle } from '../EøsKomponenter/EøsSkjemaKomponenter';

interface IProps {
    valutakurs: IRestValutakurs;
    åpenBehandling: IBehandling;
    visFeilmeldinger: boolean;
}

const ValutakursTabellRad = ({ valutakurs, åpenBehandling, visFeilmeldinger }: IProps) => {
    const [erValutakursEkspandert, settErValutakursEkspandert] = useState(false);

    const barn: OptionType[] = valutakurs.barnIdenter.map(barn => ({
        value: barn,
        label: lagPersonLabel(barn, åpenBehandling.personer),
    }));

    const {
        form,
        onSubmit,
        slettValutakurs,
        sletterValutakurs,
        erManuellInputAvKurs,
        initielFom,
        behandlingsÅrsakErOvergangsordning,
    } = useValutakursSkjema({
        valutakurs,
        barnIValutakurs: barn,
        lukkSkjema: () => settErValutakursEkspandert(false),
    });

    useEffect(() => {
        if (visFeilmeldinger && erValutakursEkspandert) {
            form.trigger();
        }
    }, [visFeilmeldinger, erValutakursEkspandert]);

    const toggleForm = (visAlert: boolean) => {
        if (erValutakursEkspandert && visAlert && form.formState.isDirty) {
            alert('Valutakurs har endringer som ikke er lagret!');
        } else {
            settErValutakursEkspandert(!erValutakursEkspandert);
            form.reset();
        }
    };

    return (
        <Table.ExpandableRow
            togglePlacement="right"
            open={erValutakursEkspandert}
            onOpenChange={() => toggleForm(true)}
            id={valutakursFeilmeldingId(valutakurs)}
            content={
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <ValutakursTabellRadEndre
                            valutakurs={valutakurs}
                            tilgjengeligeBarn={barn}
                            initielFom={initielFom}
                            erManuellInputAvKurs={erManuellInputAvKurs}
                            behandlingsÅrsakErOvergangsordning={behandlingsÅrsakErOvergangsordning}
                            onAvbryt={() => toggleForm(false)}
                            slettValutakurs={slettValutakurs}
                            sletterValutakurs={sletterValutakurs}
                        />
                    </form>
                </FormProvider>
            }
        >
            <StatusBarnCelleOgPeriodeCelle
                status={valutakurs.status}
                barnIdenter={valutakurs.barnIdenter}
                personer={åpenBehandling.personer}
                periode={{
                    fom: valutakurs.fom,
                    tom: valutakurs.tom,
                }}
            />
            <Table.DataCell>
                {isoStringTilFormatertString({
                    isoString: valutakurs.valutakursdato,
                    tilFormat: Datoformat.DATO,
                    defaultString: '-',
                })}
            </Table.DataCell>
            <Table.DataCell>{valutakurs.valutakode ? valutakurs.valutakode : '-'}</Table.DataCell>
        </Table.ExpandableRow>
    );
};

export default ValutakursTabellRad;
