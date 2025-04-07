import React from 'react';

import { Table } from '@navikt/ds-react';

import AnnenVurderingTabellRad from './AnnenVurderingTabellRad';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '../../../../../../typer/vilkår';

export const annenVurderingFeilmeldingId = (annenVurdering: IAnnenVurdering) =>
    `annen-vurdering_${annenVurdering.type}_${annenVurdering.id}`;

export const annenVurderingBegrunnelseFeilmeldingId = (annenVurdering: IAnnenVurdering) =>
    `annen-vurdering-begrunnelse_${annenVurdering.type}_${annenVurdering.id}`;

interface IProps {
    person: IGrunnlagPerson;
    andreVurderinger: IAnnenVurdering[];
    annenVurderingConfig: IAnnenVurderingConfig;
}

const AnnenVurderingTabell: React.FC<IProps> = ({
    person,
    annenVurderingConfig,
    andreVurderinger,
}) => {
    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Vurdering</Table.HeaderCell>
                    <Table.HeaderCell>Begrunnelse</Table.HeaderCell>
                    <Table.HeaderCell />
                    <Table.HeaderCell />
                    <Table.HeaderCell />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {andreVurderinger.map((annenVurdering: IAnnenVurdering, index: number) => {
                    return (
                        <AnnenVurderingTabellRad
                            key={`${index}_${person.fødselsdato}_${annenVurdering.type}`}
                            annenVurderingConfig={annenVurderingConfig}
                            person={person}
                            annenVurdering={annenVurdering}
                        />
                    );
                })}
            </Table.Body>
        </Table>
    );
};

export default AnnenVurderingTabell;
