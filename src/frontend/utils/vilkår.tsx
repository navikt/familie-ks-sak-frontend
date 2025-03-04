import type { ReactNode } from 'react';
import React from 'react';

import styled from 'styled-components';

import { StarsEuIcon, FlagCrossIcon } from '@navikt/aksel-icons';

import { Regelverk, VilkårType } from '../typer/vilkår';

const NorskFlaggIkon = styled(FlagCrossIcon)`
    font-size: 1.5rem;
    min-width: 1.5rem;
`;

const EuIkon = styled(StarsEuIcon)`
    font-size: 1.5rem;
    min-width: 1.5rem;
`;

export const erIkkeGenereltVilkår = (vilkårType: VilkårType): boolean =>
    [
        VilkårType.BOR_MED_SØKER,
        VilkårType.BOSATT_I_RIKET,
        VilkårType.MEDLEMSKAP,
        VilkårType.MEDLEMSKAP_ANNEN_FORELDER,
    ].includes(vilkårType);

export const alleRegelverk: Record<Regelverk, { tekst: string; symbol: ReactNode }> = {
    [Regelverk.NASJONALE_REGLER]: {
        tekst: 'Nasjonale regler',
        symbol: <NorskFlaggIkon />,
    },
    [Regelverk.EØS_FORORDNINGEN]: {
        tekst: 'EØS-forordningen',
        symbol: <EuIkon />,
    },
};
