import React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

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
import NavLogo from '../ikoner/NavLogo';

const StyledNavIkon = styled(NavLogo)`
    path {
        fill: var(--a-white);
    }

    margin: auto;
    height: 100%;
    width: 100%;
`;

const StyledNavIkonContaier = styled.div<{
    $adresseBeskyttet: boolean;
    $kjønn: string;
    $størrelse: string;
}>`
    border-radius: 100%;
    padding: 2px;
    place-content: center;

    min-height: 24px;
    min-width: 24px;
    max-height: 24px;
    max-width: 24px;

    background-color: var(--a-blue-400);

    ${props => {
        if (props.$størrelse === 'm') {
            return `
                min-height: 32px;
                min-width: 32px;
                max-height: 32px;
                max-width: 32px;
            `;
        }
    }}

    ${props => {
        if (props.$kjønn === 'KVINNE') {
            return `
            background-color: var(--a-purple-400);
        `;
        }
    }}

    ${props => {
        if (props.$adresseBeskyttet) {
            return `
                path {
                    fill: var(--a-orange-600);
                }
            `;
        }
    }};
`;

interface PersonIkonProps {
    kjønn: kjønnType;
    erBarn: boolean;
    størrelse?: 's' | 'm';
    erAdresseBeskyttet?: boolean;
    harTilgang?: boolean;
    erNavAnsatt?: boolean;
}

export const PersonIkon = ({
    kjønn,
    erBarn,
    størrelse = 's',
    erAdresseBeskyttet = false,
    harTilgang = true,
    erNavAnsatt = false,
}: PersonIkonProps) => {
    if (!harTilgang) {
        return <IkkeTilgang height={30} width={30} />;
    }

    if (erNavAnsatt) {
        return (
            <StyledNavIkonContaier
                $adresseBeskyttet={erAdresseBeskyttet}
                $kjønn={kjønn}
                $størrelse={størrelse}
            >
                <StyledNavIkon />
            </StyledNavIkonContaier>
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
