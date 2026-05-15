import { useErLesevisning } from '@hooks/useErLesevisning';
import { useOppdaterBegrunnelserMutationState } from '@hooks/useOppdaterStandardbegrunnelserMutationState';
import type { OptionType } from '@typer/common';
import { type Begrunnelse, type BegrunnelseType, Standardbegrunnelse } from '@typer/vedtak';
import { begrunnelseTyper } from '@typer/vedtak';
import { finnBegrunnelseType, hentBakgrunnsfarge, hentBorderfarge } from '@utils/vedtakUtils';
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

const GroupLabel = styled.div`
    color: black;
`;

export function BegrunnelserMultiselect() {
    const { vedtaksperiodeMedBegrunnelser, onChangeBegrunnelse, grupperteBegrunnelser } = useVedtaksperiodeContext();
    const { alleBegrunnelser } = useAlleBegrunnelserContext();

    const erLesevisning = useErLesevisning();
    const oppdaterBegrunnelserMutation = useOppdaterBegrunnelserMutationState(vedtaksperiodeMedBegrunnelser.id);

    const begrunnelser = mapBegrunnelserTilSelectOptions(vedtaksperiodeMedBegrunnelser, alleBegrunnelser);

    const vedtaksperiodeInneholderFramtidigOpphørBegrunnelse =
        vedtaksperiodeMedBegrunnelser.begrunnelser.filter(
            vedtaksBegrunnelser =>
                (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
                Standardbegrunnelse.OPPHØR_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS
        ).length > 0;

    const erRedigeringDeaktivert = vedtaksperiodeInneholderFramtidigOpphørBegrunnelse || erLesevisning;

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
            }),
    };

    return (
        <FamilieReactSelect
            id={`${vedtaksperiodeMedBegrunnelser.id}`}
            value={begrunnelser}
            propSelectStyles={propSelectStyles}
            placeholder={'Velg begrunnelse(r)'}
            isLoading={oppdaterBegrunnelserMutation?.status === 'pending'}
            isDisabled={erRedigeringDeaktivert || oppdaterBegrunnelserMutation?.status === 'pending'}
            feil={oppdaterBegrunnelserMutation?.error?.message}
            label="Velg standardtekst i brev"
            creatable={false}
            erLesevisning={erRedigeringDeaktivert}
            isMulti={true}
            menuPosition="fixed"
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
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
}
