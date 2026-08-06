import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFeatureToggles } from '@hooks/useFeatureToggles';
import RegistrerSøknadGammel from '@sider/Fagsak/Behandling/sider/RegistrerSøknad/RegistrerSøknad';
import { SøknadProvider } from '@sider/Fagsak/Behandling/sider/RegistrerSøknad/SøknadContext';
import { RegistrerSøknadForm } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/RegistrerSøknadForm';
import { SøknadRegistrert } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/SøknadRegistrert';
import { Steg } from '@sider/Fagsak/Behandling/sider/Steg';
import { FeatureToggle } from '@typer/featureToggles';

export function RegistrerSøknad() {
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();
    const toggles = useFeatureToggles();

    if (toggles[FeatureToggle.brukNyRegistrerSøknad]) {
        return (
            <Steg tittel={'Registrer opplysninger fra søknaden'} maxWidth={'60rem'}>
                {behandling.søknadsgrunnlag && !erLesevisning && <SøknadRegistrert />}
                <RegistrerSøknadForm />
            </Steg>
        );
    }

    return (
        <SøknadProvider>
            <RegistrerSøknadGammel />
        </SøknadProvider>
    );
}
