import type { ReactNode } from 'react';

import { oppdaterVilkårResultat } from '@api/oppdaterVilkårResultat';
import { BehandlingProvider } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '@sider/Fagsak/Behandling/context/HentOgSettBehandlingContext';
import { EkspanderbareVilkårResultatRaderProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { VilkårsvurderingProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/VilkårsvurderingContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import { fireEvent } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagPersonResultat } from '@testutils/testdata/personResultatTestdata';
import { lagGrunnlagPerson } from '@testutils/testdata/personTestdata';
import { lagVilkårResultat, lagVilkårResultatUi } from '@testutils/testdata/vilkårResultatTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { BehandlingSteg } from '@typer/behandling';
import { PersonType } from '@typer/person';
import { Regelverk, Resultat, vilkårConfig, VilkårType } from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Table } from '@navikt/ds-react';

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

function Wrapper({ children }: { children: ReactNode }) {
    return (
        <TestProviders>
            <FagsakProvider fagsak={lagFagsak()}>
                <HentOgSettBehandlingProvider>
                    <BehandlingProvider behandling={behandling}>
                        <VilkårsvurderingProvider>
                            <EkspanderbareVilkårResultatRaderProvider>
                                <Table>
                                    <Table.Body>{children}</Table.Body>
                                </Table>
                            </EkspanderbareVilkårResultatRaderProvider>
                        </VilkårsvurderingProvider>
                    </BehandlingProvider>
                </HentOgSettBehandlingProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

function renderBosattIRiket() {
    return render(
        <BosattIRiket
            lagretVilkårResultat={lagVilkårResultatUi(lagretVilkårResultat)}
            vilkårFraConfig={vilkårConfig.BOSATT_I_RIKET}
            person={søker}
            settFokusPåLeggTilPeriodeKnapp={vi.fn()}
        />,
        { wrapper: Wrapper }
    );
}

describe('BosattIRiket', () => {
    test('bytte til EØS-forordningen fjerner nasjonal utdypende vilkårsvurdering og krever ett EØS-valg', async () => {
        // Arrange
        const { screen, user } = renderBosattIRiket();
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.NASJONALE_REGLER);
        await user.click(screen.getByRole('radio', { name: 'Ja' }));
        await user.click(screen.getByRole('combobox', { name: 'Utdypende vilkårsvurdering' }));
        fireEvent.click(await screen.findByRole('option', { name: 'Bosatt på Svalbard' }));
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));
        expect(await screen.findByText('F.o.m. må settes før du kan gå videre')).toBeInTheDocument();

        expect(screen.getByText('Bosatt på Svalbard')).toBeInTheDocument();

        // Act
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.EØS_FORORDNINGEN);

        // Assert
        expect(await screen.findByText('Du må velge ett alternativ')).toBeInTheDocument();
        expect(screen.queryByText('Bosatt på Svalbard')).not.toBeInTheDocument();
        expect(oppdaterVilkårResultat).not.toHaveBeenCalled();
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
