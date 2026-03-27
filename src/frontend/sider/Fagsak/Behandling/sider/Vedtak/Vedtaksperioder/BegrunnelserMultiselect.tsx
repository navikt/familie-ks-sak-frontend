import styled from 'styled-components';

import { BodyShort, Label } from '@navikt/ds-react';
import {
    type ActionMeta,
    FamilieReactSelect,
    type FormatOptionLabelMeta,
    type GroupBase,
    type StylesConfig,
} from '@navikt/familie-form-elements';

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

    const propSelectStyles: StylesConfig<OptionType, boolean, GroupBase<OptionType>> = {
        container: (provided, props) =>
            Object.assign({}, provided, {
                maxWidth: '50rem',
                zIndex: props.isFocused ? 1000 : 1,
            }),
        groupHeading: provided =>
            Object.assign({}, provided, {
                textTransform: 'none',
            }),
        multiValue: (provided, props) => {
            const currentOption = props.data;
            const vedtakBegrunnelseType: BegrunnelseType | undefined = finnBegrunnelseType(
                alleBegrunnelser,
                currentOption.value as Begrunnelse
            );

            return Object.assign({}, provided, {
                backgroundColor: hentBakgrunnsfarge(vedtakBegrunnelseType),
                border: `1px solid ${hentBorderfarge(vedtakBegrunnelseType)}`,
                borderRadius: '0.5rem',
            });
        },
        multiValueLabel: provided =>
            Object.assign({}, provided, {
                whiteSpace: 'pre-wrap',
                textOverflow: 'hidden',
                overflow: 'hidden',
            }),
    };

    return (
        <FamilieReactSelect
            id={`${id}`}
            value={begrunnelser}
            propSelectStyles={propSelectStyles}
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
