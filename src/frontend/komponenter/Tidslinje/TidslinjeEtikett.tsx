import { useEffect } from 'react';

import classNames from 'classnames';

import { Button } from '@navikt/ds-react';
import type { Etikett } from '@navikt/familie-tidslinje';

import { TidslinjeVindu, useTidslinjeContext } from './TidslinjeContext';
import styles from './TidslinjeEtikett.module.css';

interface IEtikettProp {
    etikett: Etikett;
}

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
        <Button
            className={classNames(styles.etikettKnapp, {
                [styles.valgtEtikett]:
                    !!aktivEtikett && aktivEtikett.date.toDateString() === etikett.date.toDateString(),
            })}
            variant="tertiary"
            size="xsmall"
            disabled={aktivtTidslinjeVindu.vindu.id === TidslinjeVindu.TRE_ÅR}
            onClick={onEtikettClick}
        >
            {etikett.label}
        </Button>
    );
};

export default TidslinjeEtikett;
