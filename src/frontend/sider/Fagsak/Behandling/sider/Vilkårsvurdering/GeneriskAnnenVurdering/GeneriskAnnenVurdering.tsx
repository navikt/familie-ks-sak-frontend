import type { IGrunnlagPerson } from '@typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '@typer/vilkår';

import { Box, Heading } from '@navikt/ds-react';

import { AnnenVurderingTabell } from './AnnenVurderingTabell';

interface Props {
    person: IGrunnlagPerson;
    andreVurderinger: IAnnenVurdering[];
    annenVurderingConfig: IAnnenVurderingConfig;
}

export function GeneriskAnnenVurdering({ person, annenVurderingConfig, andreVurderinger }: Props) {
    return (
        <Box marginBlock={'space-64 space-0'}>
            <Heading size="medium" level="3">
                {annenVurderingConfig.tittel}
            </Heading>
            <AnnenVurderingTabell
                person={person}
                annenVurderingConfig={annenVurderingConfig}
                andreVurderinger={andreVurderinger}
            />
        </Box>
    );
}
