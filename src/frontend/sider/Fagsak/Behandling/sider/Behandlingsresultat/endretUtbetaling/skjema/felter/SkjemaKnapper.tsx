import { useSlettEndretUtbetalingAndel } from '@hooks/useSlettEndretUtbetalingAndel';
import { TrashIcon } from '@navikt/aksel-icons';
import { Button, HStack } from '@navikt/ds-react';
import { byggSuksessRessurs } from '@navikt/familie-typer';
import { useFormContext } from 'react-hook-form';

import { useBehandlingContext } from '../../../../../context/BehandlingContext';
import { useEndretUtbetalingAndelContext } from '../../EndretUtbetalingAndelContext';
import type { EndretUtbetalingAndelFormValues } from '../endretUtbetalingAndelSkjemaTyper';

interface Props {
    lukkSkjema: () => void;
}

export function SkjemaKnapper({ lukkSkjema }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { endretUtbetalingAndel } = useEndretUtbetalingAndelContext();
    const {
        reset,
        setError,
        formState: { isSubmitting },
    } = useFormContext<EndretUtbetalingAndelFormValues>();

    const { mutateAsync: slett, isPending: sletter } = useSlettEndretUtbetalingAndel({
        behandlingId: behandling.behandlingId,
        endretUtbetalingAndelId: endretUtbetalingAndel.id,
    });

    function avbryt() {
        reset();
        lukkSkjema();
    }

    function slettEndretUtbetalingAndel() {
        return slett()
            .then(oppdatertBehandling => settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling)))
            .catch(e => {
                const message = e instanceof Error ? e.message : 'En ukjent feil oppstod.';
                setError('root', { message });
            });
    }

    const låsKnapper = isSubmitting || sletter;

    return (
        <HStack justify={'space-between'}>
            <HStack gap={'space-8'}>
                <Button
                    size={'small'}
                    variant={'secondary'}
                    type={'submit'}
                    loading={isSubmitting}
                    disabled={låsKnapper}
                >
                    Bekreft
                </Button>
                <Button size={'small'} variant={'tertiary'} type={'button'} onClick={avbryt} disabled={låsKnapper}>
                    Avbryt
                </Button>
            </HStack>
            <Button
                size={'small'}
                variant={'tertiary'}
                type={'button'}
                icon={<TrashIcon />}
                onClick={slettEndretUtbetalingAndel}
                loading={sletter}
                disabled={låsKnapper}
            >
                Fjern periode
            </Button>
        </HStack>
    );
}
