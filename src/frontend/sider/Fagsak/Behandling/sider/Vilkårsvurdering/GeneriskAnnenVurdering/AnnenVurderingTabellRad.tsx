import { useState } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import type { IGrunnlagPerson } from '@typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '@typer/vilkår';
import { Resultat, uiResultat } from '@typer/vilkår';
import deepEqual from 'deep-equal';

import { PersonIcon } from '@navikt/aksel-icons';
import { BodyShort, HStack, Table, Tooltip } from '@navikt/ds-react';

import { AnnenVurderingSkjema } from './AnnenVurderingSkjema';
import { annenVurderingFeilmeldingId } from './AnnenVurderingTabell';
import Styles from './AnnenVurderingTabellRad.module.css';
import VilkårResultatIkon from '../../../../../../ikoner/VilkårResultatIkon';

interface Props {
    person: IGrunnlagPerson;
    annenVurderingConfig: IAnnenVurderingConfig;
    annenVurdering: IAnnenVurdering;
}

export function AnnenVurderingTabellRad({ person, annenVurderingConfig, annenVurdering }: Props) {
    const erLesevisning = useErLesevisning();

    const [ekspandertAnnenVurdering, settEkspandertAnnenVurdering] = useState(
        erLesevisning || annenVurdering.resultat === Resultat.IKKE_VURDERT
    );
    const [redigerbartAnnenVurdering, settRedigerbartAnnenVurdering] = useState<IAnnenVurdering>(annenVurdering);

    const toggleForm = (visAlert: boolean) => {
        if (ekspandertAnnenVurdering && visAlert && !deepEqual(annenVurdering, redigerbartAnnenVurdering)) {
            alert('Vurderingen har endringer som ikke er lagret!');
        } else {
            settEkspandertAnnenVurdering(!ekspandertAnnenVurdering);
            settRedigerbartAnnenVurdering(annenVurdering);
        }
    };

    return (
        <Table.ExpandableRow
            open={ekspandertAnnenVurdering}
            togglePlacement={'right'}
            id={annenVurderingFeilmeldingId(annenVurdering)}
            onOpenChange={() => toggleForm(true)}
            content={
                <AnnenVurderingSkjema
                    person={person}
                    annenVurderingConfig={annenVurderingConfig}
                    annenVurdering={annenVurdering}
                    toggleForm={toggleForm}
                    erLesevisning={erLesevisning}
                />
            }
        >
            <Table.DataCell>
                <HStack justify={'start'} align={'center'} gap={'space-6'} wrap={false}>
                    <VilkårResultatIkon resultat={annenVurdering.resultat} />
                    <BodyShort>{uiResultat[annenVurdering.resultat]}</BodyShort>
                </HStack>
            </Table.DataCell>
            <Table.DataCell>
                <Tooltip content={annenVurdering.begrunnelse} className={Styles.tooltip}>
                    <BodyShort className={Styles.beskrivelse}>{annenVurdering.begrunnelse}</BodyShort>
                </Tooltip>
            </Table.DataCell>
            <Table.DataCell>
                {annenVurdering.erVurdert && (
                    <HStack justify={'start'} align={'center'} gap={'space-6'} wrap={false}>
                        <PersonIcon title={'Manuell vurdering'} className={Styles.ikon} />
                        <BodyShort>Vurdert i denne behandlingen</BodyShort>
                    </HStack>
                )}
            </Table.DataCell>
        </Table.ExpandableRow>
    );
}
