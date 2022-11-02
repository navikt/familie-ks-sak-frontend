import { mockSøker } from '../../utils/test/person/person.mock';
import type { YtelseType } from '../beregning';
import type { IGrunnlagPerson } from '../person';
import type { IUtbetalingsperiodeDetalj } from '../vedtaksperiode';

interface IMockUtbetalingsperiodeDetalj {
    person?: IGrunnlagPerson;
    ytelseType?: YtelseType;
    utbetaltPerMnd?: number;
    erPåvirketAvEndring?: boolean;
    prosent?: number;
}

export const lagUtbetalingsperiodeDetalj = ({
    person = mockSøker(),
    utbetaltPerMnd = 0,
    erPåvirketAvEndring = false,
    prosent = 100,
}: IMockUtbetalingsperiodeDetalj = {}): IUtbetalingsperiodeDetalj => ({
    person: person,
    utbetaltPerMnd: utbetaltPerMnd,
    erPåvirketAvEndring: erPåvirketAvEndring,
    prosent: prosent,
});
