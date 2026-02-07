import { CalendarIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';

const EndreEndringstidspunkt = ({ åpneModal }: { åpneModal: () => void }) => {
    return (
        <ActionMenu.Item onClick={åpneModal}>
            <CalendarIcon fontSize={'1.4rem'} />
            Oppdater endringstidspunkt
        </ActionMenu.Item>
    );
};

export default EndreEndringstidspunkt;
