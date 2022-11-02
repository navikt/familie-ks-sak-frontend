import { mockSøker } from '../../utils/test/person/person.mock';
import { YtelseType } from '../beregning';
import type { IGrunnlagPerson } from '../person';
import type { IUtbetalingsperiodeDetalj } from '../vedtaksperiode';

interface IMockUtbetalingsperiodeDetalj {
    person?: IGrunnlagPerson;
    ytelseType?: YtelseType;
    utbetaltPerMnd?: number;
    erPåvirketAvEndring?: boolean;
    antallTimer?: number;
    prosent?: number;
}

export const lagUtbetalingsperiodeDetalj = ({
    person = mockSøker(),
    ytelseType = YtelseType.ORDINÆR_KONTANTSTØTTE,
    utbetaltPerMnd = 0,
    erPåvirketAvEndring = false,
    antallTimer = 0,
    prosent = 100,
}: IMockUtbetalingsperiodeDetalj = {}): IUtbetalingsperiodeDetalj => ({
    person: person,
    ytelseType: ytelseType,
    utbetaltPerMnd: utbetaltPerMnd,
    erPåvirketAvEndring: erPåvirketAvEndring,
    antallTimer: antallTimer,
    prosent: prosent,
});
