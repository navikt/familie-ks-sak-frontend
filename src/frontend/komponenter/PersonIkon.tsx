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
