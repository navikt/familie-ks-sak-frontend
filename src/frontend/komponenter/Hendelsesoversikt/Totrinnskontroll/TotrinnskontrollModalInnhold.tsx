import { HStack } from '@navikt/ds-react';

import StatusIkon, { Status } from '../../../ikoner/StatusIkon';
import { TotrinnskontrollBeslutning } from '../../../typer/totrinnskontroll';

interface IProps {
    beslutning: TotrinnskontrollBeslutning;
}

const TotrinnskontrollModalInnhold = ({ beslutning }: IProps) => {
    if (beslutning === TotrinnskontrollBeslutning.IKKE_VURDERT) {
        return (
            <HStack wrap={false} align={'center'} gap="4">
                <StatusIkon status={Status.FEIL} />
                Beslutning er IKKE_VURDERT. Ta kontakt med kontantstøtteteamet.
            </HStack>
        );
    } else {
        return (
            <HStack wrap={false} align={'center'} gap="4">
                <StatusIkon status={Status.OK} />
                {beslutning === TotrinnskontrollBeslutning.GODKJENT
                    ? 'Behandlingen er godkjent, og vedtaket er iverksatt'
                    : 'Behandlingen er ikke godkjent og er sendt tilbake til saksbehandler'}
            </HStack>
        );
    }
};

export default TotrinnskontrollModalInnhold;
