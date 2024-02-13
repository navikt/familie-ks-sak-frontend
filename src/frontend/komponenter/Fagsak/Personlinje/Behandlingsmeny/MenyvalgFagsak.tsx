import React from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { Dropdown } from '@navikt/ds-react';

import { LeggTilEllerFjernBrevmottakere } from './LeggTilEllerFjernBrevmottakere/LeggTilEllerFjernBrevmottakere';
import OpprettBehandling from './OpprettBehandling/OpprettBehandling';
import { useApp } from '../../../../context/AppContext';
import { useFagsakContext } from '../../../../context/fagsak/FagsakContext';
import type { IMinimalFagsak } from '../../../../typer/fagsak';
import { ToggleNavn } from '../../../../typer/toggles';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

const MenyvalgFagsak = ({ minimalFagsak }: IProps) => {
    const navigate = useNavigate();
    const { toggles } = useApp();

    const erPåDokumentutsending = useLocation().pathname.includes('dokumentutsending');
    const { manuelleBrevmottakerePåFagsak } = useFagsakContext();

    return (
        <>
            <OpprettBehandling minimalFagsak={minimalFagsak} />
            {toggles[ToggleNavn.manuellBrevmottaker] && erPåDokumentutsending ? (
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
