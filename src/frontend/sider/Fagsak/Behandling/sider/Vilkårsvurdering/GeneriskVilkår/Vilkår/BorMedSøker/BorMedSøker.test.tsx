import { oppdaterVilkårResultat } from '@api/oppdaterVilkårResultat';
import { renderIVilkårsvurdering } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/testutils/renderIVilkårsvurdering';
import { waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagPersonResultat } from '@testutils/testdata/personResultatTestdata';
import { lagGrunnlagPerson } from '@testutils/testdata/personTestdata';
import { lagVilkårResultat, lagVilkårResultatUi } from '@testutils/testdata/vilkårResultatTestdata';
import { BehandlingSteg } from '@typer/behandling';
import { PersonType } from '@typer/person';
import {
    Regelverk,
    Resultat,
    UtdypendeVilkårsvurderingEøsBarnBorMedSøker,
    VilkårType,
    vilkårConfig,
} from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { BorMedSøker } from './BorMedSøker';

vi.mock('@api/oppdaterVilkårResultat');

afterEach(() => {
    vi.clearAllMocks();
});

const barn = lagGrunnlagPerson({ personIdent: '10987654321', fødselsdato: '2023-05-17', type: PersonType.BARN });

const lagretVilkårResultat = lagVilkårResultat({
    id: 42,
    vilkårType: VilkårType.BOR_MED_SØKER,
    resultat: Resultat.IKKE_VURDERT,
    begrunnelse: '',
});

const behandling = lagBehandling({
    steg: BehandlingSteg.VILKÅRSVURDERING,
    personer: [barn],
    personResultater: [lagPersonResultat({ personIdent: barn.personIdent, vilkårResultater: [lagretVilkårResultat] })],
});

function renderBorMedSøker(vilkårResultat = lagretVilkårResultat) {
    return renderIVilkårsvurdering(
        <BorMedSøker
            lagretVilkårResultat={lagVilkårResultatUi(vilkårResultat)}
            vilkårFraConfig={vilkårConfig.BOR_MED_SØKER}
            person={barn}
            settFokusPåLeggTilPeriodeKnapp={vi.fn()}
        />,
        { behandling }
    );
}

describe('BorMedSøker', () => {
    test('krever ikke utdypende vilkårsvurdering når vilkåret ikke er oppfylt etter EØS-forordningen', async () => {
        // Arrange
        const { screen, user } = renderBorMedSøker();
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);

        // Act
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.EØS_FORORDNINGEN);
        await user.click(screen.getByRole('radio', { name: 'Nei' }));
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        await waitFor(() => expect(oppdaterVilkårResultat).toHaveBeenCalledTimes(1));
        expect(screen.queryByRole('combobox', { name: 'Utdypende vilkårsvurdering' })).not.toBeInTheDocument();
        expect(oppdaterVilkårResultat).toHaveBeenCalledWith(
            behandling.behandlingId,
            expect.objectContaining({
                endretVilkårResultat: expect.objectContaining({
                    resultat: Resultat.IKKE_OPPFYLT,
                    vurderesEtter: Regelverk.EØS_FORORDNINGEN,
                    utdypendeVilkårsvurderinger: [],
                }),
            })
        );
    });

    test('fjerner lagret utdypende vilkårsvurdering som ikke er mulig når vilkåret ikke er oppfylt etter EØS-forordningen', async () => {
        // Arrange
        const { screen, user } = renderBorMedSøker({
            ...lagretVilkårResultat,
            resultat: Resultat.IKKE_OPPFYLT,
            vurderesEtter: Regelverk.EØS_FORORDNINGEN,
            periodeFom: '2024-06-01',
            utdypendeVilkårsvurderinger: [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_SØKER],
        });
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);

        // Act
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        await waitFor(() => expect(oppdaterVilkårResultat).toHaveBeenCalledTimes(1));
        expect(oppdaterVilkårResultat).toHaveBeenCalledWith(
            behandling.behandlingId,
            expect.objectContaining({
                endretVilkårResultat: expect.objectContaining({ utdypendeVilkårsvurderinger: [] }),
            })
        );
    });
});
