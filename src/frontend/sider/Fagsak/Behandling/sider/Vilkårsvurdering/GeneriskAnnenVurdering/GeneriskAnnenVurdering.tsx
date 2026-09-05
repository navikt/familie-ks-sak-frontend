import type { IGrunnlagPerson } from '@typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '@typer/vilkår';

import { Heading } from '@navikt/ds-react';

import { AnnenVurderingTabell } from './AnnenVurderingTabell';
import styles from './GeneriskAnnenVurdering.module.css';

interface Props {
    person: IGrunnlagPerson;
    andreVurderinger: IAnnenVurdering[];
    annenVurderingConfig: IAnnenVurderingConfig;
}

export function GeneriskAnnenVurdering({ person, annenVurderingConfig, andreVurderinger }: Props) {
    return (
        <div className={styles.container}>
            <Heading size="medium" level="3">
                {annenVurderingConfig.tittel}
            </Heading>
            <AnnenVurderingTabell
                person={person}
                annenVurderingConfig={annenVurderingConfig}
                andreVurderinger={andreVurderinger}
            />
        </div>
    );
}
