import React from 'react';

import classNames from 'classnames';

import {
    GuttIkon,
    JenteIkon,
    KvinneIkon,
    MannIkon,
    NøytralPersonIkon,
} from '@navikt/familie-ikoner';
import { kjønnType } from '@navikt/familie-typer';

import styles from './PersonIkon.module.css';
import IkkeTilgang from '../ikoner/IkkeTilgang';

interface PersonIkonProps {
    kjønn: kjønnType;
    erBarn: boolean;
    størrelse?: 's' | 'm';
    erAdresseBeskyttet?: boolean;
    harTilgang?: boolean;
}

export const PersonIkon = ({
    kjønn,
    erBarn,
    størrelse = 's',
    erAdresseBeskyttet = false,
    harTilgang = true,
}: PersonIkonProps) => {
    if (!harTilgang) {
        return <IkkeTilgang height={30} width={30} />;
    }

    if (kjønn === kjønnType.KVINNE) {
        return erBarn ? (
            <JenteIkon
                className={classNames(styles.kvinnelig, styles.litenIkon, {
                    [styles.storIkon]: størrelse === 'm',
                    [styles.adresseBeskyttet]: erAdresseBeskyttet,
                })}
            />
        ) : (
            <KvinneIkon
                className={classNames(styles.kvinnelig, styles.litenIkon, {
                    [styles.storIkon]: størrelse === 'm',
                    [styles.adresseBeskyttet]: erAdresseBeskyttet,
                })}
            />
        );
    }
    if (kjønn === kjønnType.MANN) {
        return erBarn ? (
            <GuttIkon
                className={classNames(styles.mannlig, styles.litenIkon, {
                    [styles.storIkon]: størrelse === 'm',
                    [styles.adresseBeskyttet]: erAdresseBeskyttet,
                })}
            />
        ) : (
            <MannIkon
                className={classNames(styles.mannlig, styles.litenIkon, {
                    [styles.storIkon]: størrelse === 'm',
                    [styles.adresseBeskyttet]: erAdresseBeskyttet,
                })}
            />
        );
    }

    return (
        <NøytralPersonIkon
            className={classNames(styles.litenIkon, {
                [styles.storIkon]: størrelse === 'm',
                [styles.nøytralAdresseBeskyttet]: erAdresseBeskyttet,
            })}
        />
    );
};
