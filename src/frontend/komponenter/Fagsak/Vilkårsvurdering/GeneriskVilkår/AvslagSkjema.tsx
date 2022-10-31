import React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { SkjemaGruppe } from 'nav-frontend-skjema';

import { BodyShort, Checkbox } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import type { VedtakBegrunnelse } from '../../../../typer/vedtak';
import type { IVilkårResultat } from '../../../../typer/vilkår';
import { VedtaksbegrunnelseTeksterProvider } from '../../Vedtak/VedtakBegrunnelserTabell/Context/VedtaksbegrunnelseTeksterContext';
import AvslagBegrunnelseMultiselect from './AvslagBegrunnelseMultiselect';

interface IProps {
    vilkår: IVilkårResultat;
    erEksplisittAvslagPåSøknad: Felt<boolean>;
    avslagBegrunnelser: Felt<VedtakBegrunnelse[]>;
    visFeilmeldinger: boolean;
}

const MarginSkjemaGruppe = styled(SkjemaGruppe)`
    margin: 1.5rem 0 2.5rem 0 !important;
    .skjemaelement {
        margin-bottom: 0 !important;
    }
    > div:nth-child(2) {
        margin: 0.5rem 0 0 0;
        & > div {
            max-width: 100%;
            z-index: 999;
        }
    }
`;

const AvslagSkjema: React.FC<IProps> = ({
    erEksplisittAvslagPåSøknad,
    vilkår,
    avslagBegrunnelser,
    visFeilmeldinger,
}) => {
    const { vurderErLesevisning } = useBehandling();
    const lesevisning = vurderErLesevisning();

    return (
        <MarginSkjemaGruppe feil={visFeilmeldinger ? avslagBegrunnelser.feilmelding : ''}>
            {lesevisning ? (
                erEksplisittAvslagPåSøknad.verdi && (
                    <BodyShort
                        className={classNames('skjemaelement', 'lese-felt')}
                        children={'Vurderingen er et avslag'}
                    />
                )
            ) : (
                <Checkbox
                    value={'Vurderingen er et avslag'}
                    checked={erEksplisittAvslagPåSøknad.verdi}
                    onChange={event =>
                        erEksplisittAvslagPåSøknad.validerOgSettFelt(event.target.checked)
                    }
                >
                    {'Vurderingen er et avslag'}
                </Checkbox>
            )}
            {erEksplisittAvslagPåSøknad.verdi && (
                <VedtaksbegrunnelseTeksterProvider>
                    <AvslagBegrunnelseMultiselect
                        vilkårType={vilkår.vilkårType}
                        begrunnelser={avslagBegrunnelser}
                    />
                </VedtaksbegrunnelseTeksterProvider>
            )}
        </MarginSkjemaGruppe>
    );
};

export default AvslagSkjema;
