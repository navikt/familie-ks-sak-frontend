import React from 'react';

import type { GroupBase } from 'react-select';
import styled from 'styled-components';

import { Alert, BodyShort, Label } from '@navikt/ds-react';
import { ASurfaceActionHover } from '@navikt/ds-tokens/dist/tokens';
import type { ActionMeta, FormatOptionLabelMeta } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import useAvslagBegrunnelseMultiselect from './useAvslagBegrunnelseMultiselect';
import type { OptionType } from '../../../../../../typer/common';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import { BegrunnelseType, begrunnelseTyper } from '../../../../../../typer/vedtak';
import type { VilkårType } from '../../../../../../typer/vilkår';
import type { Regelverk } from '../../../../../../typer/vilkår';
import {
    finnBegrunnelseType,
    hentBakgrunnsfarge,
    hentBorderfarge,
} from '../../../../../../utils/vedtakUtils';
import { useBehandlingContext } from '../../../context/BehandlingContext';
import { useVedtaksbegrunnelseTekster } from '../../Vedtak/VedtakBegrunnelserTabell/Context/VedtaksbegrunnelseTeksterContext';

interface IProps {
    vilkårType: VilkårType;
    begrunnelser: Felt<Begrunnelse[]>;
    regelverk?: Regelverk;
}

const GroupLabel = styled.div`
    color: black;
`;

const AvslagBegrunnelseMultiselect: React.FC<IProps> = ({
    vilkårType,
    begrunnelser,
    regelverk,
}) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const { vedtaksbegrunnelseTekster } = useVedtaksbegrunnelseTekster();

    const { grupperteAvslagsbegrunnelser } = useAvslagBegrunnelseMultiselect(vilkårType, regelverk);

    const valgteBegrunnlser = begrunnelser
        ? begrunnelser.verdi.map((valgtBegrunnelse: Begrunnelse) => ({
              value: valgtBegrunnelse?.toString() ?? '',
              label:
                  grupperteAvslagsbegrunnelser
                      .flatMap(valgGruppertPåType => valgGruppertPåType.options)
                      .find(
                          (restVedtakBegrunnelseTilknyttetVilkår: OptionType) =>
                              restVedtakBegrunnelseTilknyttetVilkår.value === valgtBegrunnelse
                      )?.label ?? '',
          }))
        : [];

    const onChangeBegrunnelse = (action: ActionMeta<OptionType>) => {
        switch (action.action) {
            case 'select-option':
                if (action.option) {
                    begrunnelser.validerOgSettFelt([
                        ...begrunnelser.verdi,
                        action.option.value as Begrunnelse,
                    ]);
                } else {
                    throw new Error('Klarer ikke legge til begrunnelse');
                }
                break;
            case 'pop-value':
            case 'remove-value':
                begrunnelser.validerOgSettFelt(
                    begrunnelser.verdi.filter(
                        begrunnelse => begrunnelse !== action.removedValue?.value
                    )
                );
                break;
            case 'clear':
                begrunnelser.validerOgSettFelt([]);
                break;
            default:
                throw new Error('Ukjent action ved onChange på vedtakbegrunnelser');
        }
    };

    if (vedtaksbegrunnelseTekster.status === RessursStatus.FEILET) {
        return <Alert variant="error">Klarte ikke å hente inn begrunnelser for vilkår.</Alert>;
    }

    return (
        <FamilieReactSelect
            value={valgteBegrunnlser}
            label={'Velg standardtekst i brev'}
            creatable={false}
            placeholder={'Velg begrunnelse(r)'}
            erLesevisning={vurderErLesevisning()}
            isMulti={true}
            onChange={(_, action: ActionMeta<OptionType>) => {
                onChangeBegrunnelse(action);
            }}
            options={grupperteAvslagsbegrunnelser}
            formatGroupLabel={(group: GroupBase<OptionType>) => {
                return (
                    <GroupLabel>
                        <Label>{group.label}</Label>
                        <hr />
                    </GroupLabel>
                );
            }}
            formatOptionLabel={(
                option: OptionType,
                formatOptionLabelMeta: FormatOptionLabelMeta<OptionType>
            ) => {
                if (formatOptionLabelMeta.context == 'value') {
                    // Formatering når alternativet er valgt
                    const begrunnelseType = finnBegrunnelseType(
                        vedtaksbegrunnelseTekster,
                        option.value as Begrunnelse
                    );
                    const begrunnelseTypeLabel =
                        begrunnelseTyper[begrunnelseType as BegrunnelseType];
                    return (
                        <BodyShort>
                            <b>{begrunnelseTypeLabel}</b>: {option.label}
                        </BodyShort>
                    );
                } else {
                    // Formatering når alternativet er i nedtrekkslisten
                    return <BodyShort>{option.label}</BodyShort>;
                }
            }}
            propSelectStyles={{
                container: provided => ({
                    ...provided,
                    maxWidth: '25rem',
                }),
                groupHeading: provided => ({
                    ...provided,
                    textTransform: 'none',
                }),
                multiValue: provided => {
                    return {
                        ...provided,
                        backgroundColor: hentBakgrunnsfarge(BegrunnelseType.AVSLAG),
                        border: `1px solid ${hentBorderfarge(BegrunnelseType.AVSLAG)}`,
                        borderRadius: '0.5rem',
                    };
                },
                multiValueLabel: provided => ({
                    ...provided,
                    whiteSpace: 'pre-wrap',
                    textOverflow: 'hidden',
                    overflow: 'hidden',
                }),
                multiValueRemove: provided => ({
                    ...provided,
                    ':hover': {
                        backgroundColor: ASurfaceActionHover,
                        color: 'white',
                        borderRadius: '0 .4rem .4rem 0',
                    },
                }),
            }}
        />
    );
};

export default AvslagBegrunnelseMultiselect;
