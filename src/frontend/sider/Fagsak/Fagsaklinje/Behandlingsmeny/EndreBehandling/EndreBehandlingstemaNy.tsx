import { ActionMenu } from '@navikt/ds-react';

interface Props {
    åpneModal: () => void;
}

export function EndreBehandlingstemaNy({ åpneModal }: Props) {
    return <ActionMenu.Item onSelect={åpneModal}>Endre behandlingstema</ActionMenu.Item>;
}
