import { InformationSquareIcon } from '@navikt/aksel-icons';
import { InfoCard } from '@navikt/ds-react';

export function BehandlingUtenVedtaksbrevAdvarsel() {
    return (
        <InfoCard data-color={'info'}>
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden={true} />}>
                Du er inne på en teknisk behandling og det finnes ingen vedtaksbrev.
            </InfoCard.Message>
        </InfoCard>
    );
}
