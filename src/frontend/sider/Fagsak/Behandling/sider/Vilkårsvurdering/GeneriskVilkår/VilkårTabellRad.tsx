import type { PropsWithChildren } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { type IVilkårResultat, uiResultat } from '@typer/vilkår';
import { Datoformat, isoDatoPeriodeTilFormatertString, isoStringTilFormatertString } from '@utils/dato';
import { alleRegelverk } from '@utils/vilkår';

import { CogIcon, CogRotationIcon, PersonIcon } from '@navikt/aksel-icons';
import { BodyShort, HStack, Table, Tooltip } from '@navikt/ds-react';

import { vilkårFeilmeldingId } from './VilkårTabell';
import Styles from './VilkårTabellRad.module.css';
import VilkårResultatIkon from '../../../../../../ikoner/VilkårResultatIkon';

interface Props extends PropsWithChildren {
    toggleForm: (visAlert: boolean) => void;
    lagretVilkårResultat: IVilkårResultat;
    erVilkårEkspandert: boolean;
}

export function VilkårTabellRad({ toggleForm, lagretVilkårResultat, erVilkårEkspandert, children }: Props) {
    const behandling = useBehandling();

    const periodeErTom = !lagretVilkårResultat.periode.fom && !lagretVilkårResultat.periode.tom;

    return (
        <Table.ExpandableRow
            open={erVilkårEkspandert}
            togglePlacement={'right'}
            onOpenChange={() => toggleForm(true)}
            id={vilkårFeilmeldingId(lagretVilkårResultat)}
            content={children}
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
                            ? lagretVilkårResultat.behandlingId === behandling.behandlingId
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
