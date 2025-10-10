import styled from 'styled-components';

import { Fieldset, Heading } from '@navikt/ds-react';
import { ASpacing16 } from '@navikt/ds-tokens/dist/tokens';

import AnnenVurderingTabell from './AnnenVurderingTabell';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '../../../../../../typer/vilkår';

interface IProps {
    person: IGrunnlagPerson;
    andreVurderinger: IAnnenVurdering[];
    annenVurderingConfig: IAnnenVurderingConfig;
}

const StyledFieldset = styled(Fieldset)`
    margin-top: ${ASpacing16};
`;

const GeneriskAnnenVurdering = ({ person, annenVurderingConfig, andreVurderinger }: IProps) => {
    return (
        <StyledFieldset legend={annenVurderingConfig.tittel} hideLegend>
            <Heading size="medium" level="3">
                {annenVurderingConfig.tittel}
            </Heading>
            <AnnenVurderingTabell
                person={person}
                annenVurderingConfig={annenVurderingConfig}
                andreVurderinger={andreVurderinger}
            />
        </StyledFieldset>
    );
};

export default GeneriskAnnenVurdering;
