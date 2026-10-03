import { BegrunnelseType } from '@typer/vedtak';
import { type AlleBegrunnelser, Regelverk, VilkårType } from '@typer/vilkår';
import { describe, expect, test } from 'vitest';

import { finnAvslagsbegrunnelserForVilkår } from './finnAvslagsbegrunnelserForVilkår';

const alleBegrunnelser = {
    [BegrunnelseType.AVSLAG]: [
        { id: 'AVSLAG_BOR_MED_SØKER', navn: 'Nasjonal bor med søker', vilkår: VilkårType.BOR_MED_SØKER },
        { id: 'AVSLAG_MEDLEMSKAP', navn: 'Nasjonal medlemskap', vilkår: VilkårType.MEDLEMSKAP },
    ],
    [BegrunnelseType.EØS_AVSLAG]: [
        { id: 'EØS_AVSLAG_BOR_MED_SØKER', navn: 'EØS bor med søker', vilkår: VilkårType.BOR_MED_SØKER },
    ],
} as AlleBegrunnelser;

describe('finnAvslagsbegrunnelserForVilkår', () => {
    test('skal kun gi EØS-avslagsbegrunnelser når vilkåret vurderes etter EØS-forordningen', () => {
        // Act
        const begrunnelser = finnAvslagsbegrunnelserForVilkår(
            VilkårType.BOR_MED_SØKER,
            Regelverk.EØS_FORORDNINGEN,
            alleBegrunnelser
        );

        // Assert
        expect(begrunnelser).toEqual([{ label: 'EØS bor med søker', value: 'EØS_AVSLAG_BOR_MED_SØKER' }]);
    });

    test('skal gi nasjonale avslagsbegrunnelser under EØS-forordningen når vilkåret mangler EØS-avslagsbegrunnelser', () => {
        // Act
        const begrunnelser = finnAvslagsbegrunnelserForVilkår(
            VilkårType.MEDLEMSKAP,
            Regelverk.EØS_FORORDNINGEN,
            alleBegrunnelser
        );

        // Assert
        expect(begrunnelser).toEqual([{ label: 'Nasjonal medlemskap', value: 'AVSLAG_MEDLEMSKAP' }]);
    });
});
