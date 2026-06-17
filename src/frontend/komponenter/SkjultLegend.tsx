import type { PropsWithChildren } from 'react';

import styles from './SkjultLegend.module.css';

const SkjultLegend = ({ children }: PropsWithChildren) => <legend className={styles.skjultLegend}>{children}</legend>;

export default SkjultLegend;
