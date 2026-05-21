import type { PropsWithChildren } from 'react';

import { Button, HStack } from '@navikt/ds-react';

import { NavigeringsRetning } from './TidslinjeContext';
import FamilieChevron from '../../ikoner/FamilieChevron';

interface IProps extends PropsWithChildren {
    naviger: (retning: NavigeringsRetning) => void;
    kanNavigereTilHøyre?: boolean;
    kanNavigereTilVenstre?: boolean;
    navigerTilVenstreTittel?: string;
    navigerTilHyøyreTittel?: string;
}

const TidslinjeNavigering = ({
    naviger,
    kanNavigereTilHøyre = true,
    kanNavigereTilVenstre = true,
    navigerTilVenstreTittel,
    navigerTilHyøyreTittel,
    children,
}: IProps) => {
    return (
        <HStack gap={'space-12'}>
            <Button
                title={'Naviger til venstre'}
                variant="tertiary"
                size="small"
                disabled={!kanNavigereTilVenstre}
                onClick={() => naviger(NavigeringsRetning.VENSTRE)}
            >
                <FamilieChevron title={'Naviger til venstre'} retning={'venstre'} />
                <span className="sr-only">
                    {navigerTilVenstreTittel ? navigerTilVenstreTittel : 'Naviger til venstre i tidslinjen'}
                </span>
            </Button>
            {children}
            <Button
                title={'Naviger til høyre'}
                variant="tertiary"
                size="small"
                disabled={!kanNavigereTilHøyre}
                onClick={() => naviger(NavigeringsRetning.HØYRE)}
            >
                <FamilieChevron title={'Naviger til høyre'} />
                <span className="sr-only">
                    {navigerTilHyøyreTittel ? navigerTilHyøyreTittel : 'Naviger til høyre i tidslinjen'}
                </span>
            </Button>
        </HStack>
    );
};

export default TidslinjeNavigering;
