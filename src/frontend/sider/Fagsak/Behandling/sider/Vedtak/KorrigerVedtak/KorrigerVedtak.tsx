import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import { useKorrigertVedtakContext } from '@sider/Fagsak/Behandling/sider/Vedtak/KorrigerVedtak/KorrigertVedtakContext';

interface Props {
    åpneModal: () => void;
}

export function KorrigerVedtak({ åpneModal }: Props) {
    const { korrigertVedtak } = useKorrigertVedtakContext();
    return (
        <ActionMenu.Item onClick={åpneModal}>
            <ExclamationmarkTriangleIcon fontSize={'1.4rem'} />
            {korrigertVedtak ? <>Vis korrigert vedtak</> : <>Korriger vedtak</>}
        </ActionMenu.Item>
    );
}
