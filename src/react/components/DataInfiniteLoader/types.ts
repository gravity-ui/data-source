import type {DataInfiniteWrapperProps, MoreViewProps} from '../DataInfiniteWrapper';
import type {DataLoaderProps} from '../DataLoader';
import type {ErrorViewProps} from '../types';

export interface DataInfiniteLoaderProps<
    TError,
    TLoadingViewProps extends object = {},
    TErrorViewProps extends ErrorViewProps<TError> = ErrorViewProps<TError>,
    TMoreViewProps extends MoreViewProps = MoreViewProps,
> extends DataLoaderProps<TError, TLoadingViewProps, TErrorViewProps>,
        Omit<DataInfiniteWrapperProps<TMoreViewProps>, 'children'> {}
