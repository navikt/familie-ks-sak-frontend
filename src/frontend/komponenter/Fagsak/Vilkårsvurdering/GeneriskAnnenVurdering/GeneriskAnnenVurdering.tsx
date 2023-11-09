import React from 'react';

import styled from 'styled-components';

import { Fieldset } from '@navikt/ds-react';

import AnnenVurderingTabell from './AnnenVurderingTabell';
import type { IGrunnlagPerson } from '../../../../typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '../../../../typer/vilkår';

interface IProps {
    person: IGrunnlagPerson;
    andreVurderinger: IAnnenVurdering[];
    annenVurderingConfig: IAnnenVurderingConfig;
}

const Container = styled.div`
    margin-top: 1rem;
    :not(:first-child) {
        margin-top: 2.5rem;
    }
`;

const GeneriskAnnenVurdering: React.FC<IProps> = ({
    person,
    annenVurderingConfig,
    andreVurderinger,
}) => {
    return (
        <Container>
            <Fieldset legend={annenVurderingConfig.tittel}>
                <AnnenVurderingTabell
                    person={person}
                    annenVurderingConfig={annenVurderingConfig}
                    andreVurderinger={andreVurderinger}
                />
            </Fieldset>
        </Container>
    );
};

export default GeneriskAnnenVurdering;
