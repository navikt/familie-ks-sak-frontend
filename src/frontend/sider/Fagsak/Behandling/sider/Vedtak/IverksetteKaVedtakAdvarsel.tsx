import { InformationSquareIcon } from '@navikt/aksel-icons';
import { InfoCard } from '@navikt/ds-react';

export function IverksetteKaVedtakAdvarsel() {
    return (
        <InfoCard data-color={'info'}>
            <InfoCard.Header icon={<InformationSquareIcon aria-hidden={true} />}>
                <InfoCard.Title>Du er i en iverksette KA-vedtak behandling.</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
                Det skal ikke sendes vedtaksbrev. Bruk "Send brev" hvis du skal informere bruker om:
                <ul>
                    <li>Utbetaling</li>
                    <li>EØS-kompetanse</li>
                </ul>
            </InfoCard.Content>
        </InfoCard>
    );
}
