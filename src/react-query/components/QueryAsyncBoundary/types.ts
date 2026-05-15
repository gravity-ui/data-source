import type {AsyncBoundaryProps} from '../../../react';

export interface QueryAsyncBoundaryProps extends AsyncBoundaryProps {}

export interface QueryAsyncBoundaryComponent<TProps extends object> extends React.FC<TProps> {
    Content: React.ComponentType<TProps>;
    Loading: QueryAsyncBoundaryProps['LoadingView'];
    Error: QueryAsyncBoundaryProps['ErrorView'];
}
