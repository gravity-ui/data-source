import {act, renderHook} from '@testing-library/react';

import type {DataLoaderStatus} from '../../../core';
import {useKeepPreviousError} from '../useKeepPreviousError';

interface TestError {
    code: number;
}

const forbidden: TestError = {code: 403};
const unavailable: TestError = {code: 503};

interface Props {
    enabled?: boolean;
    status: DataLoaderStatus;
    error: TestError | null;
    errorUpdatedAt: number;
}

const render = (initialProps: Props) =>
    renderHook(
        ({enabled, status, error, errorUpdatedAt}: Props) =>
            useKeepPreviousError(enabled, status, error, errorUpdatedAt),
        {initialProps},
    );

const loading = (errorUpdatedAt = 0, enabled = true): Props => ({
    enabled,
    status: 'loading',
    error: null,
    errorUpdatedAt,
});

const failed = (errorUpdatedAt: number, error: TestError = forbidden, enabled = true): Props => ({
    enabled,
    status: 'error',
    error,
    errorUpdatedAt,
});

const succeeded = (errorUpdatedAt = 0, enabled = true): Props => ({
    enabled,
    status: 'success',
    error: null,
    errorUpdatedAt,
});

describe('useKeepPreviousError', () => {
    it('should pass the first loading through', () => {
        const {result} = render(loading());

        expect(result.current).toMatchObject({status: 'loading', error: null});
    });

    it('should pass an error through', () => {
        const {result} = render(failed(100));

        expect(result.current).toMatchObject({status: 'error', error: forbidden});
    });

    it('should keep the error while the same query is retried', () => {
        const {result, rerender} = render(failed(100));

        rerender(loading(100));

        expect(result.current).toMatchObject({status: 'error', error: forbidden});
    });

    it('should release the kept error once the query succeeds', () => {
        const {result, rerender} = render(failed(100));

        rerender(loading(100));
        rerender(succeeded(100));
        rerender(loading(100));

        expect(result.current).toMatchObject({status: 'loading', error: null});
    });

    it('should keep the latest error', () => {
        const {result, rerender} = render(failed(100));

        rerender(failed(200, unavailable));
        rerender(loading(200));

        expect(result.current).toMatchObject({status: 'error', error: unavailable});
    });

    it('should not keep the error of another query', () => {
        const {result, rerender} = render(failed(100));

        rerender(loading(0));

        expect(result.current).toMatchObject({status: 'loading', error: null});
    });

    it('should show loading again after forget', () => {
        const {result, rerender} = render(failed(100));

        act(() => {
            result.current.forget();
        });
        rerender(loading(100));

        expect(result.current).toMatchObject({status: 'loading', error: null});
    });

    it('should do nothing when disabled', () => {
        const {result, rerender} = render(failed(100, forbidden, false));

        rerender(loading(100, false));

        expect(result.current).toMatchObject({status: 'loading', error: null});
    });
});
