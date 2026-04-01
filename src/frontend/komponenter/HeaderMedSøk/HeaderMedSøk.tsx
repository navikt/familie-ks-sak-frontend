import { Header } from '@navikt/familie-header';

import FagsakDeltagerSøk from './FagsakDeltagerSøk';
import { useSaksbehandler } from '../../hooks/useSaksbehandler';

export function HeaderMedSøk() {
    const saksbehandler = useSaksbehandler();

    const eksterneLenker = [
        {
            name: 'Rekvirer D-nr i DREK',
            href: `${window.origin}/redirect/drek`,
            isExternal: true,
        },
        {
            name: 'Barnehagelister',
            href: `/barnehagelister`,
            isExternal: false,
        },
        {
            name: 'nEESSI',
            href: `${window.origin}/redirect/neessi`,
            isExternal: true,
        },
    ];

    return (
        <Header
            tittel={'Nav Kontantstøtte'}
            brukerinfo={{ navn: saksbehandler.displayName, enhet: saksbehandler.enhet }}
            brukerPopoverItems={[{ name: 'Logg ut', href: `${window.origin}/auth/logout` }]}
            eksterneLenker={eksterneLenker}
        >
            <FagsakDeltagerSøk />
        </Header>
    );
}
