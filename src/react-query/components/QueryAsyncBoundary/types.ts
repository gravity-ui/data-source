import type {ComponentType} from 'react';

import type {AsyncBoundaryProps, ErrorViewProps} from '../../../react';

export interface QueryAsyncBoundaryProps extends AsyncBoundaryProps {}

export interface QueryAsyncBoundaryComponent<TProps extends object> extends React.FC<TProps> {
    Content: React.ComponentType<TProps>;
    Loading: ComponentType<TProps>;
    Error: ComponentType<TProps & ErrorViewProps>;
}
