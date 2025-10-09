import { Header } from '@navikt/familie-header';

import FagsakDeltagerSøk from './FagsakDeltagerSøk';

interface IHeaderMedSøkProps {
    brukerNavn?: string;
    brukerEnhet?: string;
}

export const HeaderMedSøk: React.FunctionComponent<IHeaderMedSøkProps> = ({ brukerNavn, brukerEnhet }) => {
    const genererEksterneLenker = () => {
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

        return eksterneLenker;
    };

    return (
        <Header
            tittel="Nav Kontantstøtte"
            brukerinfo={{ navn: brukerNavn ?? 'Ukjent', enhet: brukerEnhet ?? 'Ukjent' }}
            brukerPopoverItems={[{ name: 'Logg ut', href: `${window.origin}/auth/logout` }]}
            eksterneLenker={genererEksterneLenker()}
        >
            <FagsakDeltagerSøk />
        </Header>
    );
};
