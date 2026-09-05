import { useErLesevisning } from '@hooks/useErLesevisning';
import type { IGrunnlagPerson } from '@typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '@typer/vilkår';
import { useFormContext } from 'react-hook-form';

import { Button, Fieldset, HStack } from '@navikt/ds-react';

import { AnnenVurderingBegrunnelseFelt } from './AnnenVurderingBegrunnelseFelt';
import { AnnenVurderingResultatFelt } from './AnnenVurderingResultatFelt';
import type { AnnenVurderingFormValues } from './useAnnenVurderingSkjema';
import { SkjemaRamme } from '../SkjemaRamme';

interface Props {
    annenVurdering: IAnnenVurdering;
    annenVurderingConfig: IAnnenVurderingConfig;
    person: IGrunnlagPerson;
    onAvbryt: () => void;
}

export function AnnenVurderingSkjema({ annenVurdering, annenVurderingConfig, person, onAvbryt }: Props) {
    const erLesevisning = useErLesevisning();

    const {
        formState: { isSubmitting, errors },
    } = useFormContext<AnnenVurderingFormValues>();

    return (
        <Fieldset
            error={errors.root?.message}
            errorPropagation={false}
            legend={'Skjema for å gjøre vurderingen'}
            hideLegend
        >
            <SkjemaRamme lesevisning={erLesevisning} resultat={annenVurdering.resultat}>
                <AnnenVurderingResultatFelt person={person} annenVurderingConfig={annenVurderingConfig} />
                <AnnenVurderingBegrunnelseFelt />
                {!erLesevisning && (
                    <HStack gap={'space-16'} marginBlock={'space-16'}>
                        <Button type={'submit'} size={'small'} variant={'secondary'} loading={isSubmitting}>
                            Ferdig
                        </Button>
                        <Button type={'button'} onClick={onAvbryt} size={'small'} variant={'tertiary'}>
                            Avbryt
                        </Button>
                    </HStack>
                )}
            </SkjemaRamme>
        </Fieldset>
    );
}
