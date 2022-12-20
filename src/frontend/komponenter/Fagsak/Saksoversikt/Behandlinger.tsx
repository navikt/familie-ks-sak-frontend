import React, { useState } from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { BodyShort, Heading, Switch } from '@navikt/ds-react';

import { useFagsakContext } from '../../../context/FagsakContext';
import { erBehandlingHenlagt } from '../../../typer/behandling';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import type { IKlagebehandling } from '../../../typer/klage';
import type { ITilbakekrevingsbehandling } from '../../../typer/tilbakekrevingsbehandling';
import { Behandlingsresultatstype } from '../../../typer/tilbakekrevingsbehandling';
import { kalenderDiff } from '../../../utils/kalender';
import { Behandling } from './Behandling';
import type { VisningBehandling } from './visningBehandling';

const SwitchHøyre = styled(Switch)`
    margin-top: 1rem;
    margin-right: 0.275rem;
    float: right;
`;

const StyledHeading = styled(Heading)`
    margin-top: 3.75rem;
`;

const StyledOpprettetKolonne = styled.th`
    width: 10%;
`;

const StyledResultatKolonne = styled.th`
    width: 22%;
`;

interface IBehandlingshistorikkProps {
    minimalFagsak: IMinimalFagsak;
}

export enum Saksoversiktstype {
    KONTANTSTØTTE = 'KONTANTSTØTTE',
    TIlBAKEBETALING = 'TILBAKBETALING',
    KLAGE = 'KLAGE',
}

export type Saksoversiktsbehanlding =
    | (VisningBehandling & {
          saksoversiktstype: Saksoversiktstype.KONTANTSTØTTE;
      })
    | (ITilbakekrevingsbehandling & {
          saksoversiktstype: Saksoversiktstype.TIlBAKEBETALING;
      })
    | (IKlagebehandling & {
          saksoversiktstype: Saksoversiktstype.KLAGE;
      });

const visRad = (behandling: Saksoversiktsbehanlding, visHenlagteBehandlinger: boolean) => {
    if (visHenlagteBehandlinger) return true;
    if (!behandling.resultat) return true;
    if (behandling.saksoversiktstype === Saksoversiktstype.KONTANTSTØTTE) {
        return !erBehandlingHenlagt(behandling.resultat);
    }
    return Behandlingsresultatstype.HENLAGT !== behandling.resultat;
};

export const hentOpprettetTidspunkt = (saksoversiktsbehandling: Saksoversiktsbehanlding) => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
        case Saksoversiktstype.TIlBAKEBETALING:
            return saksoversiktsbehandling.opprettetTidspunkt;
        case Saksoversiktstype.KLAGE:
            return saksoversiktsbehandling.opprettet;
    }
};

export const hentBehandlingId = (saksoversiktsbehandling: Saksoversiktsbehanlding) => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
        case Saksoversiktstype.TIlBAKEBETALING:
            return saksoversiktsbehandling.behandlingId;
        case Saksoversiktstype.KLAGE:
            return saksoversiktsbehandling.id;
    }
};

const hentBehandlingerTilSaksoversikten = (
    minimalFagsak: IMinimalFagsak,
    klagebehandlinger: IKlagebehandling[]
): Saksoversiktsbehanlding[] => {
    const kontantstøtteBehandlinger: Saksoversiktsbehanlding[] = minimalFagsak.behandlinger.map(
        behandling => ({
            ...behandling,
            saksoversiktstype: Saksoversiktstype.KONTANTSTØTTE,
        })
    );
    const tilbakekrevingsbehandlinger: Saksoversiktsbehanlding[] =
        minimalFagsak.tilbakekrevingsbehandlinger.map(behandling => ({
            ...behandling,
            saksoversiktstype: Saksoversiktstype.TIlBAKEBETALING,
        }));
    const klagebehanldinger: Saksoversiktsbehanlding[] = klagebehandlinger.map(behandling => ({
        ...behandling,
        saksoversiktstype: Saksoversiktstype.KLAGE,
    }));
    return [...kontantstøtteBehandlinger, ...tilbakekrevingsbehandlinger, ...klagebehanldinger];
};

const Behandlinger: React.FC<IBehandlingshistorikkProps> = ({ minimalFagsak }) => {
    const { klagebehandlinger } = useFagsakContext();

    const behandlinger = hentBehandlingerTilSaksoversikten(minimalFagsak, klagebehandlinger);

    const finnesRadSomKanFiltreresBort = behandlinger.some(
        (behandling: Saksoversiktsbehanlding) => !visRad(behandling, false)
    );

    const [visHenlagteBehandlinger, setVisHenlagteBehandlinger] = useState(false);

    return (
        <div className={'saksoversikt__behandlingshistorikk'}>
            <StyledHeading level="2" size={'medium'} children={'Behandlinger'} spacing />
            {behandlinger.length > 0 ? (
                <table
                    className={classNames('tabell', 'saksoversikt__behandlingshistorikk__tabell')}
                >
                    <thead>
                        <tr>
                            <StyledOpprettetKolonne children={'Opprettet'} />
                            <th children={'Årsak'} />
                            <th children={'Type'} />
                            <th children={'Behandlingstema'} />
                            <th children={'Status'} />
                            <th children={'Vedtaksdato'} />
                            <StyledResultatKolonne children={'Resultat'} />
                        </tr>
                    </thead>
                    <tbody>
                        {behandlinger
                            .filter(behandling => visRad(behandling, visHenlagteBehandlinger))
                            .sort((a, b) =>
                                kalenderDiff(
                                    new Date(hentOpprettetTidspunkt(b)),
                                    new Date(hentOpprettetTidspunkt(a))
                                )
                            )
                            .map((behandling: Saksoversiktsbehanlding) => (
                                <Behandling
                                    key={hentBehandlingId(behandling)}
                                    saksoversiktsbehandling={behandling}
                                    minimalFagsak={minimalFagsak}
                                />
                            ))}
                    </tbody>
                </table>
            ) : (
                <BodyShort children={'Ingen tidligere behandlinger'} />
            )}
            {finnesRadSomKanFiltreresBort && (
                <SwitchHøyre
                    size="small"
                    position="left"
                    id={'vis-henlagte-behandlinger'}
                    checked={visHenlagteBehandlinger}
                    onChange={() => {
                        setVisHenlagteBehandlinger(!visHenlagteBehandlinger);
                    }}
                >
                    Vis henlagte behandlinger
                </SwitchHøyre>
            )}
        </div>
    );
};

export default Behandlinger;
