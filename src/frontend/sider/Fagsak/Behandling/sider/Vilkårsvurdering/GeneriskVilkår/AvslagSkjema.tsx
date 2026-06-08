import { useErLesevisning } from '@hooks/useErLesevisning';
import type { Begrunnelse } from '@typer/vedtak';
import type { IVilkårResultat } from '@typer/vilkår';
import classNames from 'classnames';
import styled from 'styled-components';

import { BodyShort, Checkbox, Fieldset } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import AvslagBegrunnelseMultiselect from './AvslagBegrunnelseMultiselect';

interface IProps {
    lagretVilkår: IVilkårResultat;
    erEksplisittAvslagPåSøknad: Felt<boolean>;
    avslagBegrunnelser: Felt<Begrunnelse[]>;
    visFeilmeldinger: boolean;
}

const StyledFieldset = styled(Fieldset)`
    margin: 1.5rem 0 2.5rem 0 !important;
    > div:nth-child(2) {
        margin: 0.5rem 0 0 0;
        & > div {
            max-width: 100%;
            z-index: 999;
        }
    }
`;

const AvslagSkjema = ({ erEksplisittAvslagPåSøknad, lagretVilkår, avslagBegrunnelser, visFeilmeldinger }: IProps) => {
    const erLesevisning = useErLesevisning();

    return (
        <StyledFieldset
            legend={'Vurderingen er et avslag'}
            hideLegend
            error={visFeilmeldinger ? avslagBegrunnelser.feilmelding : ''}
        >
            {erLesevisning ? (
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
                    onChange={event => erEksplisittAvslagPåSøknad.validerOgSettFelt(event.target.checked)}
                >
                    {'Vurderingen er et avslag'}
                </Checkbox>
            )}
            {erEksplisittAvslagPåSøknad.verdi && (
                <AvslagBegrunnelseMultiselect
                    vilkårType={lagretVilkår.vilkårType}
                    begrunnelser={avslagBegrunnelser}
                    regelverk={lagretVilkår.vurderesEtter}
                />
            )}
        </StyledFieldset>
    );
};

export default AvslagSkjema;
