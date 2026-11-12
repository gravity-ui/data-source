import React from 'react';

import {QueryClient, QueryClientProvider, onlineManager} from '@tanstack/react-query';
import {act, renderHook, waitFor} from '@testing-library/react';

import {makeInfiniteQueryDataSource} from '../../impl/infinite/factory';
import {makePlainQueryDataSource} from '../../impl/plain/factory';
import {useQueryData} from '../useQueryData';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return {promise, resolve, reject};
}

describe.each(['plain', 'infinite'] as const)('keepPreviousError: %s', (type) => {
    function setup(keepPreviousError = true) {
        const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
        let response = deferred<string[]>();
        const fetch = jest.fn(() => response.promise);
        const config = {name: 'items', fetch};
        const source =
            type === 'plain'
                ? makePlainQueryDataSource(config)
                : makeInfiniteQueryDataSource({...config, next: () => undefined});
        const wrapper = ({children}: {children: React.ReactNode}) => (
            <QueryClientProvider client={client}>{children}</QueryClientProvider>
        );
        const hook = () =>
            renderHook(({id}) => useQueryData(source, {id}, {keepPreviousError}), {
                wrapper,
                initialProps: {id: 1},
            });
        const view = hook();
        return {
            client,
            view,
            hook,
            fetch,
            response: () => response,
            next: () => {
                response = deferred<string[]>();
                return response;
            },
        };
    }

    async function fail(s: ReturnType<typeof setup>) {
        const error = new Error('Unavailable');
        act(() => s.response().reject(error));
        await waitFor(() => expect(s.view.result.current.status).toBe('error'));
        return error;
    }

    it('keeps an error and coherent flags during a background retry, then recovers', async () => {
        const s = setup();
        expect(s.view.result.current.isLoading).toBe(true);
        const error = await fail(s);
        const response = s.next();
        act(() => {
            s.client.refetchQueries();
        });
        await waitFor(() => expect(s.view.result.current.isFetching).toBe(true));
        expect(s.view.result.current).toMatchObject({
            status: 'error',
            originalStatus: 'pending',
            error,
            isError: true,
            isPending: false,
            isSuccess: false,
            isLoading: false,
            isInitialLoading: false,
            isLoadingError: true,
            isRefetchError: false,
            isRefetching: true,
        });
        act(() => response.resolve(['item']));
        await waitFor(() => expect(s.view.result.current.status).toBe('success'));
        expect(s.view.result.current).toMatchObject({error: null, isSuccess: true, isError: false});
        s.client.clear();
    });

    it('renders loading immediately when explicitly refetching an ongoing retry', async () => {
        const s = setup();
        await fail(s);
        const response = s.next();
        act(() => {
            s.client.refetchQueries();
        });
        await waitFor(() => expect(s.view.result.current.isFetching).toBe(true));
        act(() => {
            s.view.result.current.refetch();
        });
        await waitFor(() => expect(s.view.result.current.status).toBe('loading'));
        expect(s.view.result.current).toMatchObject({error: null, isLoading: true, isError: false});
        act(() => response.resolve(['item']));
        await waitFor(() => expect(s.view.result.current.status).toBe('success'));
        s.client.clear();
    });

    it('shows loading for an explicit retry and remembers its new error', async () => {
        const s = setup();
        await fail(s);
        const response = s.next();
        act(() => {
            s.view.result.current.refetch();
        });
        await waitFor(() => expect(s.view.result.current.status).toBe('loading'));
        const error = new Error('Still unavailable');
        act(() => response.reject(error));
        await waitFor(() => expect(s.view.result.current.error).toBe(error));
        s.next();
        act(() => {
            s.client.refetchQueries();
        });
        await waitFor(() => expect(s.view.result.current.isFetching).toBe(true));
        expect(s.view.result.current.error).toBe(error);
        s.client.clear();
    });

    it('does not carry an error to a new key', async () => {
        const s = setup();
        await fail(s);
        s.next();
        s.view.rerender({id: 2});
        expect(s.view.result.current).toMatchObject({status: 'loading', error: null});
        s.client.clear();
    });

    it('does not retain the display error across remounts during a retry', async () => {
        const s = setup();
        await fail(s);
        s.next();
        act(() => {
            s.client.refetchQueries();
        });
        await waitFor(() => expect(s.view.result.current.isFetching).toBe(true));
        s.view.unmount();
        const remounted = s.hook();
        expect(remounted.result.current).toMatchObject({status: 'loading', error: null});
        remounted.unmount();
        s.client.clear();
    });

    it('retains the error while a retry is paused offline', async () => {
        const s = setup();
        await fail(s);
        s.next();
        try {
            onlineManager.setOnline(false);
            act(() => {
                s.client.refetchQueries();
            });
            await waitFor(() => expect(s.view.result.current.fetchStatus).toBe('paused'));
            expect(s.view.result.current).toMatchObject({
                status: 'error',
                originalStatus: 'pending',
                isError: true,
                isPending: false,
                isLoading: false,
                isFetching: false,
            });
        } finally {
            s.client.clear();
            onlineManager.setOnline(true);
        }
    });

    it('leaves queries with successful data unchanged during a refetch', async () => {
        const s = setup();
        act(() => s.response().resolve(['item']));
        await waitFor(() => expect(s.view.result.current.status).toBe('success'));
        const data = s.view.result.current.data;
        const response = s.next();
        act(() => {
            s.client.refetchQueries();
        });
        await waitFor(() => expect(s.view.result.current.isFetching).toBe(true));
        expect(s.view.result.current).toMatchObject({status: 'success', data, isLoading: false});
        act(() => response.reject(new Error('Unavailable')));
        await waitFor(() => expect(s.view.result.current.isRefetchError).toBe(true));
        expect(s.view.result.current.data).toEqual(data);
        s.client.clear();
    });

    it('preserves the default loading behavior when disabled', async () => {
        const s = setup(false);
        await fail(s);
        s.next();
        act(() => {
            s.client.refetchQueries();
        });
        await waitFor(() => expect(s.view.result.current.isFetching).toBe(true));
        expect(s.view.result.current).toMatchObject({
            status: 'loading',
            error: null,
            isLoading: true,
        });
        s.client.clear();
    });
});
