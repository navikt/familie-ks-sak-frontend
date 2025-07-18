import React, { useState } from 'react';

import deepEqual from 'deep-equal';
import styled from 'styled-components';

import { BodyShort, HStack, Table } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { AnnenVurderingSkjema } from './AnnenVurderingSkjema';
import { annenVurderingFeilmeldingId } from './AnnenVurderingTabell';
import ManuellVurdering from '../../../../../../ikoner/ManuellVurdering';
import VilkårResultatIkon from '../../../../../../ikoner/VilkårResultatIkon';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { IAnnenVurderingConfig, IAnnenVurdering } from '../../../../../../typer/vilkår';
import { Resultat, uiResultat } from '../../../../../../typer/vilkår';
import { useBehandlingContext } from '../../../context/BehandlingContext';

interface IProps {
    person: IGrunnlagPerson;
    annenVurderingConfig: IAnnenVurderingConfig;
    annenVurdering: IAnnenVurdering;
}

const BeskrivelseCelle = styled(BodyShort)`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const AnnenVurderingTabellRad: React.FC<IProps> = ({
    person,
    annenVurderingConfig,
    annenVurdering,
}) => {
    const { vurderErLesevisning, åpenBehandling } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const [ekspandertAnnenVurdering, settEkspandertAnnenVurdering] = useState(
        erLesevisning || false || annenVurdering.resultat === Resultat.IKKE_VURDERT
    );
    const [redigerbartAnnenVurdering, settRedigerbartAnnenVurdering] =
        useState<IAnnenVurdering>(annenVurdering);

    const toggleForm = (visAlert: boolean) => {
        if (
            ekspandertAnnenVurdering &&
            visAlert &&
            !deepEqual(annenVurdering, redigerbartAnnenVurdering)
        ) {
            alert('Vurderingen har endringer som ikke er lagret!');
        } else {
            settEkspandertAnnenVurdering(!ekspandertAnnenVurdering);
            settRedigerbartAnnenVurdering(annenVurdering);
        }
    };

    return (
        <Table.ExpandableRow
            open={ekspandertAnnenVurdering}
            togglePlacement="right"
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
                <HStack gap="4">
                    <VilkårResultatIkon resultat={annenVurdering.resultat} />
                    <BodyShort children={uiResultat[annenVurdering.resultat]} />
                </HStack>
            </Table.DataCell>
            <Table.DataCell>
                <BeskrivelseCelle children={annenVurdering.begrunnelse} />
            </Table.DataCell>
            <Table.DataCell>
                <ManuellVurdering />
            </Table.DataCell>
            <Table.DataCell>
                {åpenBehandling.status === RessursStatus.SUKSESS && annenVurdering.erVurdert
                    ? 'Vurdert i denne behandlingen'
                    : ''}
            </Table.DataCell>
        </Table.ExpandableRow>
    );
};

export default AnnenVurderingTabellRad;
