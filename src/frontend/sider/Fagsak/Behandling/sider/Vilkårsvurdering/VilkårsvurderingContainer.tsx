import { EkspanderbareVilkårResultatRaderProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { EkspanderbareVilkårsvurderingPanelerProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårsvurderingPanelerContext';
import { Vilkårsvurdering } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/Vilkårsvurdering';
import { VilkårsvurderingProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/VilkårsvurderingContext';

export function VilkårsvurderingContainer() {
    return (
        <VilkårsvurderingProvider>
            <EkspanderbareVilkårsvurderingPanelerProvider>
                <EkspanderbareVilkårResultatRaderProvider>
                    <Vilkårsvurdering />
                </EkspanderbareVilkårResultatRaderProvider>
            </EkspanderbareVilkårsvurderingPanelerProvider>
        </VilkårsvurderingProvider>
    );
}
