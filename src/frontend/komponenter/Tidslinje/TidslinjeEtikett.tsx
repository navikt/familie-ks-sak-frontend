import { useEffect } from 'react';

import styled from 'styled-components';

import { Button } from '@navikt/ds-react';
import { BgAccentStrongPressed, TextNeutral } from '@navikt/ds-tokens/dist/tokens';
import type { Etikett } from '@navikt/familie-tidslinje';

import { TidslinjeVindu, useTidslinjeContext } from './TidslinjeContext';

interface IEtikettProp {
    etikett: Etikett;
}

const EtikettKnapp = styled(Button)<{ $valgt: boolean }>`
    color: ${({ $valgt }) => $valgt && TextNeutral};
    background-color: ${({ $valgt }) => $valgt && BgAccentStrongPressed};
`;
//TODO NGHI check the colors
const TidslinjeEtikett = ({ etikett }: IEtikettProp) => {
    const {
        aktivEtikett,
        settAktivEtikett,
        aktivtTidslinjeVindu,
        initiellAktivEtikettErSatt,
        setInitiellAktivEtikettErSatt,
    } = useTidslinjeContext();

    const onEtikettClick = () => {
        settAktivEtikett(etikett);
    };

    useEffect(() => {
        if (
            !initiellAktivEtikettErSatt &&
            etikett.date.getFullYear() === new Date().getFullYear() &&
            etikett.date.getMonth() === new Date().getMonth()
        ) {
            settAktivEtikett(etikett);
            setInitiellAktivEtikettErSatt(true);
        }
    }, [etikett]);

    return (
        <EtikettKnapp
            variant="tertiary"
            size="xsmall"
            disabled={aktivtTidslinjeVindu.vindu.id === TidslinjeVindu.TRE_ÅR}
            onClick={onEtikettClick}
            $valgt={!!aktivEtikett && aktivEtikett.date.toDateString() === etikett.date.toDateString()}
        >
            {etikett.label}
        </EtikettKnapp>
    );
};

export default TidslinjeEtikett;
