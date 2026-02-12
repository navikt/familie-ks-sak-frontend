import type { GroupBase } from 'react-select';
import styled from 'styled-components';

import { BodyShort, Label } from '@navikt/ds-react';
import { AZIndexPopover } from '@navikt/ds-tokens/dist/tokens';
import { type ActionMeta, FamilieReactSelect, type FormatOptionLabelMeta } from '@navikt/familie-form-elements';

import { useAlleBegrunnelserContext } from './AlleBegrunnelserContext';
import { mapBegrunnelserTilSelectOptions } from './utils';
import { useVedtaksperiodeContext } from './VedtaksperiodeContext';
import { useOppdaterBegrunnelserMutationState } from '../../../../../../hooks/useOppdaterStandardbegrunnelserMutationState';
import type { OptionType } from '../../../../../../typer/common';
import type { Begrunnelse, BegrunnelseType } from '../../../../../../typer/vedtak';
import { begrunnelseTyper } from '../../../../../../typer/vedtak';
import { finnBegrunnelseType, hentBakgrunnsfarge, hentBorderfarge } from '../../../../../../utils/vedtakUtils';
import { useBehandlingContext } from '../../../context/BehandlingContext';

interface IProps {
    tillatKunLesevisning: boolean;
}

const GroupLabel = styled.div`
    color: black;
`;

const BegrunnelserMultiselect = ({ tillatKunLesevisning }: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = tillatKunLesevisning || vurderErLesevisning();

    const { id, onChangeBegrunnelse, grupperteBegrunnelser, vedtaksperiodeMedBegrunnelser } =
        useVedtaksperiodeContext();
    const { alleBegrunnelser } = useAlleBegrunnelserContext();
    const oppdaterBegrunnelserMutation = useOppdaterBegrunnelserMutationState(vedtaksperiodeMedBegrunnelser.id);

    const begrunnelser = mapBegrunnelserTilSelectOptions(vedtaksperiodeMedBegrunnelser, alleBegrunnelser);

    return (
        <FamilieReactSelect
            id={`${id}`}
            value={begrunnelser}
            propSelectStyles={{
                container: (provided, props) => ({
                    ...provided,
                    maxWidth: '50rem',
                    zIndex: props.isFocused ? AZIndexPopover : 1,
                }),
                groupHeading: provided => ({
                    ...provided,
                    textTransform: 'none',
                }),
                multiValue: (provided, props) => {
                    const currentOption = props.data as OptionType;
                    const begrunnelseType: BegrunnelseType | undefined = finnBegrunnelseType(
                        alleBegrunnelser,
                        currentOption.value as Begrunnelse
                    );

                    return {
                        ...provided,
                        backgroundColor: hentBakgrunnsfarge(begrunnelseType),
                        border: `1px solid ${hentBorderfarge(begrunnelseType)}`,
                        borderRadius: '0.5rem',
                    };
                },
                multiValueLabel: provided => ({
                    ...provided,
                    whiteSpace: 'pre-wrap',
                    textOverflow: 'hidden',
                    overflow: 'hidden',
                }),
            }}
            placeholder={'Velg begrunnelse(r)'}
            isDisabled={erLesevisning || oppdaterBegrunnelserMutation?.status === 'pending'}
            feil={oppdaterBegrunnelserMutation?.error?.message}
            label="Velg standardtekst i brev"
            creatable={false}
            erLesevisning={erLesevisning}
            isMulti={true}
            onChange={(_, action: ActionMeta<OptionType>) => {
                onChangeBegrunnelse(action);
            }}
            formatOptionLabel={(option: OptionType, formatOptionLabelMeta: FormatOptionLabelMeta<OptionType>) => {
                const begrunnelseType = finnBegrunnelseType(alleBegrunnelser, option.value as Begrunnelse);

                if (formatOptionLabelMeta.context === 'value') {
                    const type = begrunnelseTyper[begrunnelseType as BegrunnelseType];
                    return (
                        <BodyShort>
                            <b>{type}</b>: {option.label}
                        </BodyShort>
                    );
                } else {
                    return <BodyShort>{option.label}</BodyShort>;
                }
            }}
            formatGroupLabel={(group: GroupBase<OptionType>) => {
                return (
                    <GroupLabel>
                        <Label>{group.label}</Label>
                        <hr />
                    </GroupLabel>
                );
            }}
            options={grupperteBegrunnelser}
        />
    );
};

export default BegrunnelserMultiselect;
