import { Box, UNSAFE_Combobox } from '@navikt/ds-react';

import { useAlleBegrunnelserContext } from './AlleBegrunnelserContext';
import { mapBegrunnelserTilSelectOptions } from './utils';
import { useVedtaksperiodeContext } from './VedtaksperiodeContext';
import { useOppdaterBegrunnelserMutationState } from '../../../../../../hooks/useOppdaterStandardbegrunnelserMutationState';
import { useBehandlingContext } from '../../../context/BehandlingContext';

interface IProps {
    tillatKunLesevisning: boolean;
}

const BegrunnelserMultiselect = ({ tillatKunLesevisning }: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = tillatKunLesevisning || vurderErLesevisning();

    const { onChangeBegrunnelse, grupperteBegrunnelser, vedtaksperiodeMedBegrunnelser } = useVedtaksperiodeContext();
    const { alleBegrunnelser } = useAlleBegrunnelserContext();
    const oppdaterBegrunnelserMutation = useOppdaterBegrunnelserMutationState(vedtaksperiodeMedBegrunnelser.id);

    const begrunnelser = mapBegrunnelserTilSelectOptions(vedtaksperiodeMedBegrunnelser, alleBegrunnelser);

    return (
        <Box marginBlock={'space-0 space-16'}>
            <UNSAFE_Combobox
                selectedOptions={begrunnelser}
                placeholder={'Velg begrunnelse(r)'}
                isLoading={erLesevisning || oppdaterBegrunnelserMutation?.status === 'pending'}
                error={oppdaterBegrunnelserMutation?.error?.message}
                label="Velg standardtekst i brev"
                readOnly={erLesevisning}
                isMultiSelect
                onToggleSelected={(option, isSelected) => {
                    onChangeBegrunnelse(option, isSelected);
                }}
                options={grupperteBegrunnelser.flatMap(group => group.options)}
            />
        </Box>
    );
};

export default BegrunnelserMultiselect;
