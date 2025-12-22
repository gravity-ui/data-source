import {warn} from './warn';

export const warnDisabledRefetch = async (): Promise<void> => {
    warn('Disabled refetch is called');
};
