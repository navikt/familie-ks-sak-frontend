import { oppdaterVilkårResultat } from '@api/oppdaterVilkårResultat';
import { renderIVilkårsvurdering } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/testutils/renderIVilkårsvurdering';
import { waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagPersonResultat } from '@testutils/testdata/personResultatTestdata';
import { lagGrunnlagPerson } from '@testutils/testdata/personTestdata';
import { lagVilkårResultat, lagVilkårResultatUi } from '@testutils/testdata/vilkårResultatTestdata';
import { BehandlingSteg } from '@typer/behandling';
import { PersonType } from '@typer/person';
import { Regelverk, Resultat, VilkårType, vilkårConfig } from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { BosattIRiket } from './BosattIRiket';

vi.mock('@api/oppdaterVilkårResultat');

afterEach(() => {
    vi.clearAllMocks();
});

const søker = lagGrunnlagPerson({ personIdent: '12345678910', fødselsdato: '1990-01-01', type: PersonType.SØKER });

const lagretVilkårResultat = lagVilkårResultat({
    id: 42,
    vilkårType: VilkårType.BOSATT_I_RIKET,
    resultat: Resultat.IKKE_VURDERT,
    begrunnelse: '',
});

const behandling = lagBehandling({
    steg: BehandlingSteg.VILKÅRSVURDERING,
    personer: [søker],
    personResultater: [lagPersonResultat({ personIdent: søker.personIdent, vilkårResultater: [lagretVilkårResultat] })],
});

function renderBosattIRiket() {
    return renderIVilkårsvurdering(
        <BosattIRiket
            lagretVilkårResultat={lagVilkårResultatUi(lagretVilkårResultat)}
            vilkårFraConfig={vilkårConfig.BOSATT_I_RIKET}
            person={søker}
            settFokusPåLeggTilPeriodeKnapp={vi.fn()}
        />,
        { behandling }
    );
}

describe('BosattIRiket', () => {
    test('bytte til EØS-forordningen fjerner nasjonal utdypende vilkårsvurdering og krever ett EØS-valg', async () => {
        // Arrange
        const { screen, user } = renderBosattIRiket();
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.NASJONALE_REGLER);
        await user.click(screen.getByRole('radio', { name: 'Ja' }));
        await user.click(screen.getByRole('combobox', { name: 'Utdypende vilkårsvurdering' }));
        await user.click(await screen.findByRole('option', { name: 'Bosatt på Svalbard' }));
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));
        expect(await screen.findByText('F.o.m. må settes før du kan gå videre')).toBeInTheDocument();

        expect(screen.getByRole('option', { name: 'Bosatt på Svalbard', selected: true })).toBeInTheDocument();

        // Act
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.EØS_FORORDNINGEN);

        // Assert
        expect(await screen.findByText('Du må velge ett alternativ')).toBeInTheDocument();
        expect(screen.queryByText('Bosatt på Svalbard')).not.toBeInTheDocument();
        expect(oppdaterVilkårResultat).not.toHaveBeenCalled();
    });

    test('bytte fra Ja til Nei etter EØS-forordningen fjerner valgt utdypende vilkårsvurdering', async () => {
        // Arrange
        const { screen, user } = renderBosattIRiket();
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.EØS_FORORDNINGEN);
        await user.click(screen.getByRole('radio', { name: 'Ja' }));
        await user.click(screen.getByRole('combobox', { name: 'Utdypende vilkårsvurdering' }));
        await user.click(await screen.findByRole('option', { name: 'Omfattet av norsk lovgivning' }));
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.type(screen.getByLabelText('Begrunnelse'), 'Søker bor ikke i Norge');

        // Act
        await user.click(screen.getByRole('radio', { name: 'Nei' }));
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        await waitFor(() => expect(oppdaterVilkårResultat).toHaveBeenCalledTimes(1));
        expect(oppdaterVilkårResultat).toHaveBeenCalledWith(
            behandling.behandlingId,
            expect.objectContaining({
                endretVilkårResultat: expect.objectContaining({
                    resultat: Resultat.IKKE_OPPFYLT,
                    utdypendeVilkårsvurderinger: [],
                }),
            })
        );
    });

    test('viser feilmelding fra server i skjemaet når lagring feiler', async () => {
        // Arrange
        const { screen, user } = renderBosattIRiket();
        vi.mocked(oppdaterVilkårResultat).mockRejectedValue(new Error('Noe gikk galt på serveren'));

        // Act
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.NASJONALE_REGLER);
        await user.click(screen.getByRole('radio', { name: 'Ja' }));
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        expect(await screen.findByText('Noe gikk galt på serveren')).toBeInTheDocument();
    });
});
