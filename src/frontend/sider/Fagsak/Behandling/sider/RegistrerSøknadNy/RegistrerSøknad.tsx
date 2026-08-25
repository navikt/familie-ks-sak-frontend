import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { RegistrerSøknadForm } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/RegistrerSøknadForm';
import { SøknadRegistrert } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/SøknadRegistrert';
import { Steg } from '@sider/Fagsak/Behandling/sider/Steg';

export function RegistrerSøknad() {
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();

    return (
        <Steg tittel={'Registrer opplysninger fra søknaden'} maxWidth={'60rem'}>
            {behandling.søknadsgrunnlag && !erLesevisning && <SøknadRegistrert />}
            <RegistrerSøknadForm />
        </Steg>
    );
}
