import React from 'react';

import { useLocation, useNavigate } from 'react-router';

import { Dropdown } from '@navikt/ds-react';

import { LeggTilEllerFjernBrevmottakere } from './LeggTilEllerFjernBrevmottakere/LeggTilEllerFjernBrevmottakere';
import OpprettBehandling from './OpprettBehandling/OpprettBehandling';
import { useFagsakContext } from '../../../../context/fagsak/FagsakContext';
import type { IMinimalFagsak } from '../../../../typer/fagsak';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

const MenyvalgFagsak = ({ minimalFagsak }: IProps) => {
    const navigate = useNavigate();

    const erPåDokumentutsending = useLocation().pathname.includes('dokumentutsending');
    const { manuelleBrevmottakerePåFagsak } = useFagsakContext();

    return (
        <>
            <OpprettBehandling minimalFagsak={minimalFagsak} />
            {erPåDokumentutsending ? (
                <LeggTilEllerFjernBrevmottakere
                    erPåBehandling={false}
                    brevmottakere={manuelleBrevmottakerePåFagsak}
                />
            ) : (
                <Dropdown.Menu.List.Item
                    onClick={() => navigate(`/fagsak/${minimalFagsak.id}/dokumentutsending`)}
                >
                    Send informasjonsbrev
                </Dropdown.Menu.List.Item>
            )}
        </>
    );
};

export default MenyvalgFagsak;
