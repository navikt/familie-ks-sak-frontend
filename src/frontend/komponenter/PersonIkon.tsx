import classNames from 'classnames';

import { GuttIkon, JenteIkon, KvinneIkon, MannIkon, NøytralPersonIkon } from '@navikt/familie-ikoner';
import { kjønnType } from '@navikt/familie-typer';

import styles from './PersonIkon.module.css';
import IkkeTilgang from '../ikoner/IkkeTilgang';
import NavLogo from '../ikoner/NavLogo';

interface PersonIkonProps {
    kjønn?: kjønnType;
    erBarn?: boolean;
    størrelse?: 's' | 'm';
    erAdresseBeskyttet?: boolean;
    harTilgang?: boolean;
    erEgenAnsatt?: boolean;
}

export const PersonIkon = ({
    kjønn = kjønnType.UKJENT,
    erBarn = false,
    størrelse = 's',
    erAdresseBeskyttet = false,
    harTilgang = true,
    erEgenAnsatt = false,
}: PersonIkonProps) => {
    if (!harTilgang) {
        return <IkkeTilgang height={30} width={30} />;
    }

    if (erEgenAnsatt) {
        return (
            <div
                className={classNames(styles.ansattIkon, {
                    [styles.ansattStorIkon]: størrelse === 'm',
                    [styles.ansattMannlig]: kjønn === kjønnType.MANN,
                    [styles.ansattKvinnelig]: kjønn === kjønnType.KVINNE,
                    [styles.ansattAdresseBeskyttet]: erAdresseBeskyttet,
                })}
            >
                <NavLogo className={styles.navLogo} />
            </div>
        );
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
