import type { ButtonHTMLAttributes } from 'react';

import styles from './FamilieBaseKnapp.module.css';

export function FamilieBaseKnapp({ children }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button className={styles.knapp}>{children}</button>;
}
