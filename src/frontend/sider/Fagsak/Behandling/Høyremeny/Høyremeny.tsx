import { Activity, useEffect, useState } from 'react';

import { Button, Stack, Tabs, VStack } from '@navikt/ds-react';
import { hentDataFraRessursMedFallback } from '@navikt/familie-typer';

import { Behandlingskort } from './Behandlingskort';
import Styles from './Høyremeny.module.css';
import { HøyremenyKnappikon } from './HøyremenyKnappikon';
import { Tabvelger } from './Tabvelger';
import { useHøyremeny } from './useHøyremeny';
import { useSkalViseTotrinnskontroll } from './useSkalViseTotrinnskontroll';
import { Brev } from '../../../../komponenter/Hendelsesoversikt/BrevModul/Brev';
import Historikk from '../../../../komponenter/Hendelsesoversikt/Historikk';
import { Totrinnskontroll } from '../../../../komponenter/Hendelsesoversikt/Totrinnskontroll/Totrinnskontroll';
import { type Hendelse, TabValg } from '../../../../komponenter/Hendelsesoversikt/typer';
import type { ILogg } from '../../../../typer/logg';
import { Datoformat, isoStringTilFormatertString } from '../../../../utils/dato';
import { useBehandlingContext } from '../context/BehandlingContext';

export function Høyremeny() {
    const { behandling, logg, hentLogg } = useBehandlingContext();

    const skalViseTotrinnskontroll = useSkalViseTotrinnskontroll();

    const [erÅpen, settErÅpen] = useHøyremeny();
    const [aktivTab, settAktivTab] = useState(skalViseTotrinnskontroll ? TabValg.Totrinnskontroll : TabValg.Historikk);

    useEffect(() => {
        hentLogg();
    }, [behandling]);

    const hendelser = hentDataFraRessursMedFallback(logg, []).map(
        (loggElement: ILogg): Hendelse => ({
            id: loggElement.id.toString(),
            dato: isoStringTilFormatertString({
                isoString: loggElement.opprettetTidspunkt,
                tilFormat: Datoformat.DATO_TID,
            }),
            utførtAv: loggElement.opprettetAv,
            rolle: loggElement.rolle,
            tittel: loggElement.tittel,
            beskrivelse: loggElement.tekst,
        })
    );

    return (
        <Stack direction={'row'}>
            <Button
                title={erÅpen ? 'Skjul høyremeny' : 'Vis høyremeny'}
                aria-label={erÅpen ? 'Skjul høyremeny' : 'Vis høyremeny'}
                className={Styles.knapp}
                variant={'secondary'}
                size={'small'}
                icon={<HøyremenyKnappikon erHøyremenyÅpen={erÅpen} />}
                onMouseDown={e => e.preventDefault()}
                onClick={() => settErÅpen(prev => !prev)}
            />
            <Activity mode={erÅpen ? 'visible' : 'hidden'}>
                <VStack width={'25rem'}>
                    <Behandlingskort />
                    <Tabs value={aktivTab} onChange={tab => settAktivTab(tab as TabValg)} iconPosition={'top'}>
                        <Tabvelger skalViseTotrinnskontroll={skalViseTotrinnskontroll} />
                        <Tabs.Panel value={TabValg.Totrinnskontroll}>
                            <Totrinnskontroll />
                        </Tabs.Panel>
                        <Tabs.Panel value={TabValg.Historikk}>
                            <Historikk hendelser={hendelser} />
                        </Tabs.Panel>
                        <Tabs.Panel value={TabValg.Meldinger}>
                            <Brev onIModalClick={() => settAktivTab(TabValg.Historikk)} />
                        </Tabs.Panel>
                    </Tabs>
                </VStack>
            </Activity>
        </Stack>
    );
}
