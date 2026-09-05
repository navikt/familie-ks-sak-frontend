import type { PropsWithChildren } from 'react';

import { useBehandlingId } from '@hooks/useBehandlingId';
import VilkårResultatIkon from '@ikoner/VilkårResultatIkon';
import { useEkspanderbarVilkårResultatRad } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { type IVilkårResultat, uiResultat } from '@typer/vilkår';
import { Datoformat, isoDatoPeriodeTilFormatertString, isoStringTilFormatertString } from '@utils/dato';
import { alleRegelverk } from '@utils/vilkår';
import { FormProvider, type SubmitHandler, type UseFormReturn } from 'react-hook-form';

import { CogIcon, CogRotationIcon, PersonIcon } from '@navikt/aksel-icons';
import { BodyShort, HStack, Table, Tooltip } from '@navikt/ds-react';

import type { VilkårResultatFormValues } from './useVilkårResultatSkjema';
import { vilkårFeilmeldingId } from './VilkårTabell';
import Styles from './VilkårTabellRad.module.css';

interface Props extends PropsWithChildren {
    lagretVilkårResultat: IVilkårResultat;
    form: UseFormReturn<VilkårResultatFormValues>;
    onSubmit: SubmitHandler<VilkårResultatFormValues>;
}

export function VilkårTabellRad({ lagretVilkårResultat, form, onSubmit, children }: Props) {
    const behandlingId = useBehandlingId();
    const { erRadEkspandert, toggleRad } = useEkspanderbarVilkårResultatRad(lagretVilkårResultat.id);

    const {
        handleSubmit,
        reset,
        formState: { isDirty },
    } = form;

    const toggleForm = () => {
        const harUlagredeEndringer = erRadEkspandert && isDirty;
        toggleRad(harUlagredeEndringer);
        if (!harUlagredeEndringer) {
            reset();
        }
    };

    const periodeErTom = !lagretVilkårResultat.periode.fom && !lagretVilkårResultat.periode.tom;

    return (
        <Table.ExpandableRow
            key={`${lagretVilkårResultat.id}-${erRadEkspandert ? 'ekspandert' : 'lukket'}`} // Pga. React.Activity ikke fungerer så bra med Aksel, se https://github.com/navikt/aksel/issues/5017
            open={erRadEkspandert}
            togglePlacement={'right'}
            onOpenChange={toggleForm}
            id={vilkårFeilmeldingId(lagretVilkårResultat)}
            content={
                erRadEkspandert ? (
                    <FormProvider {...form}>
                        <form onSubmit={handleSubmit(onSubmit)}>{children}</form>
                    </FormProvider>
                ) : null
            }
        >
            <Table.DataCell className={Styles.celle}>
                <HStack justify={'start'} align={'center'} gap={'space-6'} wrap={false}>
                    <VilkårResultatIkon resultat={lagretVilkårResultat.resultat} />
                    <BodyShort>{uiResultat[lagretVilkårResultat.resultat]}</BodyShort>
                </HStack>
            </Table.DataCell>
            <Table.DataCell className={Styles.celle}>
                <BodyShort>
                    {periodeErTom ? '-' : isoDatoPeriodeTilFormatertString(lagretVilkårResultat.periode)}
                </BodyShort>
            </Table.DataCell>
            <Table.DataCell className={Styles.celle}>
                {lagretVilkårResultat.begrunnelse && (
                    <Tooltip content={lagretVilkårResultat.begrunnelse} className={Styles.tooltip}>
                        <BodyShort className={Styles.beskrivelse}>{lagretVilkårResultat.begrunnelse}</BodyShort>
                    </Tooltip>
                )}
            </Table.DataCell>
            <Table.DataCell className={Styles.celle}>
                <HStack justify={'start'} align={'center'} gap={'space-6'} wrap={false}>
                    {lagretVilkårResultat.vurderesEtter ? (
                        <>
                            {alleRegelverk[lagretVilkårResultat.vurderesEtter].symbol}
                            <BodyShort>{alleRegelverk[lagretVilkårResultat.vurderesEtter].tekst}</BodyShort>
                        </>
                    ) : (
                        <>
                            <CogIcon title={'Generell vurdering'} className={Styles.ikon} />
                            <BodyShort>Generell vurdering</BodyShort>
                        </>
                    )}
                </HStack>
            </Table.DataCell>
            <Table.DataCell className={Styles.celle}>
                <HStack justify={'start'} align={'center'} gap={'space-6'} wrap={false}>
                    {lagretVilkårResultat.erAutomatiskVurdert ? (
                        <CogRotationIcon title={'Automatisk Vurdering'} className={Styles.ikon} />
                    ) : (
                        <PersonIcon title={'Manuell vurdering'} className={Styles.ikon} />
                    )}
                    <BodyShort>
                        {lagretVilkårResultat.erVurdert
                            ? lagretVilkårResultat.behandlingId === behandlingId
                                ? 'Vurdert i denne behandlingen'
                                : `Vurdert ${isoStringTilFormatertString({
                                      isoString: lagretVilkårResultat.endretTidspunkt,
                                      tilFormat: Datoformat.DATO_FORKORTTET,
                                  })}`
                            : ''}
                    </BodyShort>
                </HStack>
            </Table.DataCell>
        </Table.ExpandableRow>
    );
}
