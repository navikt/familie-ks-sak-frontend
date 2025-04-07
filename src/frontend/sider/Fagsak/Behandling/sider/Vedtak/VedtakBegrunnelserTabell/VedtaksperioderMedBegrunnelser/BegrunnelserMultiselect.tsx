import React, { useEffect, useState } from 'react';

import type { GroupBase } from 'react-select';
import styled from 'styled-components';

import { BodyShort, Label } from '@navikt/ds-react';
import { AZIndexPopover } from '@navikt/ds-tokens/dist/tokens';
import type { ActionMeta, FormatOptionLabelMeta } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../../../../context/behandlingContext/BehandlingContext';
import type { OptionType } from '../../../../../../../typer/common';
import type { Begrunnelse, BegrunnelseType } from '../../../../../../../typer/vedtak';
import { begrunnelseTyper } from '../../../../../../../typer/vedtak';
import {
    finnBegrunnelseType,
    hentBakgrunnsfarge,
    hentBorderfarge,
} from '../../../../../../../utils/vedtakUtils';
import { useVedtaksbegrunnelseTekster } from '../Context/VedtaksbegrunnelseTeksterContext';
import { useVedtaksperiodeMedBegrunnelser } from '../Context/VedtaksperiodeMedBegrunnelserContext';
import { mapBegrunnelserTilSelectOptions } from '../Hooks/useVedtaksbegrunnelser';

interface IProps {
    tillatKunLesevisning: boolean;
}

const GroupLabel = styled.div`
    color: black;
`;

const BegrunnelserMultiselect: React.FC<IProps> = ({ tillatKunLesevisning }) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = tillatKunLesevisning || vurderErLesevisning();

    const {
        id,
        onChangeBegrunnelse,
        grupperteBegrunnelser,
        begrunnelserPut,
        vedtaksperiodeMedBegrunnelser,
    } = useVedtaksperiodeMedBegrunnelser();
    const { vedtaksbegrunnelseTekster } = useVedtaksbegrunnelseTekster();

    const [begrunnelser, settBegrunnelser] = useState<OptionType[]>([]);

    useEffect(() => {
        if (vedtaksbegrunnelseTekster.status === RessursStatus.SUKSESS) {
            settBegrunnelser(
                mapBegrunnelserTilSelectOptions(
                    vedtaksperiodeMedBegrunnelser,
                    vedtaksbegrunnelseTekster
                )
            );
        }
    }, [vedtaksperiodeMedBegrunnelser, vedtaksbegrunnelseTekster]);

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
                        vedtaksbegrunnelseTekster,
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
            isDisabled={erLesevisning || begrunnelserPut.status === RessursStatus.HENTER}
            feil={
                begrunnelserPut.status === RessursStatus.FUNKSJONELL_FEIL ||
                begrunnelserPut.status === RessursStatus.FEILET
                    ? begrunnelserPut.frontendFeilmelding
                    : undefined
            }
            label="Velg standardtekst i brev"
            creatable={false}
            erLesevisning={erLesevisning}
            isMulti={true}
            onChange={(_, action: ActionMeta<OptionType>) => {
                onChangeBegrunnelse(action);
            }}
            formatOptionLabel={(
                option: OptionType,
                formatOptionLabelMeta: FormatOptionLabelMeta<OptionType>
            ) => {
                const begrunnelseType = finnBegrunnelseType(
                    vedtaksbegrunnelseTekster,
                    option.value as Begrunnelse
                );

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
