import React from 'react';

import styled from 'styled-components';

import {
    GuttIkon,
    JenteIkon,
    KvinneIkon,
    MannIkon,
    NøytralPersonIkon,
} from '@navikt/familie-ikoner';
import { kjønnType } from '@navikt/familie-typer';

import IkkeTilgang from '../ikoner/IkkeTilgang';
import NavLogo from '../ikoner/NavLogo';

const StyledJenteIkon = styled(JenteIkon)<{ $adresseBeskyttet: boolean }>`
    ${props => {
        if (props.$adresseBeskyttet) {
            return `
            g {
                fill: var(--a-orange-600);
            }
        `;
        } else {
            return `
                g {
                    fill: var(--a-purple-400);
                }
        `;
        }
    }};
`;

const StyledKvinneIkon = styled(KvinneIkon)<{ $adresseBeskyttet: boolean }>`
    ${props => {
        if (props.$adresseBeskyttet) {
            return `
            g {
                fill: var(--a-orange-600);
            }
        `;
        } else {
            return `
                g {
                    fill: var(--a-purple-400);
                }
        `;
        }
    }};
`;

const StyledGuttIkon = styled(GuttIkon)<{ $adresseBeskyttet: boolean }>`
    ${props => {
        if (props.$adresseBeskyttet) {
            return `
            g {
                fill: var(--a-orange-600);
            }
        `;
        } else {
            return `
                g {
                    fill: var(--a-blue-400);
                }
        `;
        }
    }};
`;

const StyledMannIkon = styled(MannIkon)<{ $adresseBeskyttet: boolean }>`
    ${props => {
        if (props.$adresseBeskyttet) {
            return `
            g {
                fill: var(--a-orange-600);
            }
        `;
        } else {
            return `
                g {
                    fill: var(--a-blue-400);
                }
        `;
        }
    }};
`;

const StyledNøytralIkon = styled(NøytralPersonIkon)<{ $adresseBeskyttet: boolean }>`
    ${props => {
        if (props.$adresseBeskyttet) {
            return `
                path:first-of-type {
                    fill: var(--a-orange-600);
                }
            `;
        }
    }};
`;

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

    const ikonProps = størrelse === 's' ? { height: 24, width: 24 } : { height: 32, width: 32 };
    if (kjønn === kjønnType.KVINNE) {
        return erBarn ? (
            <StyledJenteIkon $adresseBeskyttet={erAdresseBeskyttet} {...ikonProps} />
        ) : (
            <StyledKvinneIkon $adresseBeskyttet={erAdresseBeskyttet} {...ikonProps} />
        );
    }
    if (kjønn === kjønnType.MANN) {
        return erBarn ? (
            <StyledGuttIkon $adresseBeskyttet={erAdresseBeskyttet} {...ikonProps} />
        ) : (
            <StyledMannIkon $adresseBeskyttet={erAdresseBeskyttet} {...ikonProps} />
        );
    }

    return <StyledNøytralIkon $adresseBeskyttet={erAdresseBeskyttet} {...ikonProps} />;
};
