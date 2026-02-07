import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';

import type { IRestKorrigertVedtak } from '../../../../../../typer/vedtak';

interface IKorrigerVedtak {
    åpneModal: () => void;
    korrigertVedtak?: IRestKorrigertVedtak;
}

const KorrigerVedtak = ({ åpneModal, korrigertVedtak }: IKorrigerVedtak) => {
    return (
        <ActionMenu.Item onClick={åpneModal}>
            <ExclamationmarkTriangleIcon fontSize={'1.4rem'} />
            {korrigertVedtak ? <>Vis korrigert vedtak</> : <>Korriger vedtak</>}
        </ActionMenu.Item>
    );
};

export default KorrigerVedtak;
