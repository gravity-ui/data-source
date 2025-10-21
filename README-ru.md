# Data Source &middot; [![npm version](https://img.shields.io/npm/v/@gravity-ui/data-source?logo=npm&label=version)](https://www.npmjs.com/package/@gravity-ui/data-source) [![ci](https://img.shields.io/github/actions/workflow/status/gravity-ui/data-source/ci.yml?branch=main&label=ci&logo=github)](https://github.com/gravity-ui/data-source/actions/workflows/ci.yml?query=branch:main)

`Data Source` — это простой оберточный компонент для фетчинга данных. В рамках [чистой архитектуры](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) он выполняет роль порта, позволяя создавать обертки для различных сценариев работы с данными. `Data Source` в своей основе использует [`react-query`](https://tanstack.com/query/latest).

## Установка

```bash
npm install @gravity-ui/data-source @tanstack/react-query
```

`@tanstack/react-query` является peer-зависимостью.

## Быстрый старт

### 1. Настройка DataManager

Сначала создайте и предоставьте `DataManager` в вашем приложении:

```tsx
import React from 'react';
import {ClientDataManager, DataManagerContext} from '@gravity-ui/data-source';

const dataManager = new ClientDataManager({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      retry: 3,
    },
    // ... другие опции react-query
  },
});

function App() {
  return (
    <DataManagerContext.Provider value={dataManager}>
      <YourApplication />
    </DataManagerContext.Provider>
  );
}
```

Или используйте упрощенный `DataSourceProvider` (рекомендуется):

```tsx
import {ClientDataManager, DataSourceProvider} from '@gravity-ui/data-source';

function App() {
  return (
    <DataSourceProvider dataManager={dataManager}>
      <YourApplication />
    </DataSourceProvider>
  );
}
```

### 2. Определение типов ошибок и оберток

Определите тип ошибки и создайте свои конструкторы для источников данных на основе стандартных конструкторов:

```ts
import {makePlainQueryDataSource as makePlainQueryDataSourceBase} from '@gravity-ui/data-source';

export interface ApiError {
  code: number;
  title: string;
  description?: string;
}

export const makePlainQueryDataSource = <TParams, TRequest, TResponse, TData, TError = ApiError>(
  config: Omit<PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError>, 'type'>,
): PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError> => {
  return makePlainQueryDataSourceBase(config);
};
```

### 3. Создание кастомного компонента DataLoader

Создайте компонент `DataLoader` на основе стандартного для определения отображения статуса загрузки и ошибок:

```tsx
import {
  DataLoader as DataLoaderBase,
  DataLoaderProps as DataLoaderPropsBase,
  ErrorViewProps,
} from '@gravity-ui/data-source';

export interface DataLoaderProps
  extends Omit<DataLoaderPropsBase<ApiError>, 'LoadingView' | 'ErrorView'> {
  LoadingView?: ComponentType;
  ErrorView?: ComponentType<ErrorViewProps<ApiError>>;
}

export const DataLoader: React.FC<DataLoaderProps> = ({
  LoadingView = YourLoader, // Вы можете использовать свой компонент загрузки
  ErrorView = YourError, // Вы можете использовать свой компонент ошибки
  ...restProps
}) => {
  return <DataLoaderBase LoadingView={LoadingView} ErrorView={ErrorView} {...restProps} />;
};
```

### 4. Определение вашего первого источника данных

```ts
import {skipContext} from '@gravity-ui/data-source';

// Ваша API функция
import {fetchUser} from './api';

export const userDataSource = makePlainQueryDataSource({
  // Ключи должны быть уникальными. Возможно, вам стоит создать помощник для создания имен источников данных
  name: 'user',
  // skipContext - это помощник для пропуска 2 первых параметров в функции (context и fetchContext)
  fetch: skipContext(fetchUser),
  // Опционально: генерация тегов для расширенной инвалидации кеша
  tags: (params) => [`user:${params.userId}`, 'users'],
});
```

### 5. Использование в компонентах

```tsx
import {useQueryData} from '@gravity-ui/data-source';

export const UserProfile: React.FC<{userId: number}> = ({userId}) => {
  const {data, status, error, refetch} = useQueryData(userDataSource, {userId});

  return (
    <DataLoader status={status} error={error} errorAction={refetch}>
      {data && <UserCard user={data} />}
    </DataLoader>
  );
};
```

## Основные концепции

### Типы источников данных

Библиотека предоставляет два основных типа источников данных:

#### Plain Query Data Source

Для простых паттернов запрос/ответ:

```ts
const userDataSource = makePlainQueryDataSource({
  name: 'user',
  fetch: skipContext(async (params: {userId: number}) => {
    const response = await fetch(`/api/users/${params.userId}`);
    return response.json();
  }),
});
```

#### Infinite Query Data Source

Для пагинации и бесконечной прокрутки:

```ts
const postsDataSource = makeInfiniteQueryDataSource({
  name: 'posts',
  fetch: skipContext(async (params: {page: number; limit: number}) => {
    const response = await fetch(`/api/posts?page=${params.page}&limit=${params.limit}`);
    return response.json();
  }),
  next: (lastPage, allPages) => {
    if (lastPage.hasNext) {
      return {page: allPages.length + 1, limit: 20};
    }
    return undefined;
  },
});
```

### Управление статусами

Библиотека нормализует состояния запросов в три простых статуса:

- `loading` - Фактическая загрузка данных. То же, что и `isLoading` в React Query
- `success` - Данные доступны (могут быть пропущены с помощью idle)
- `error` - Не удалось загрузить данные

### Концепция idle

Библиотека предоставляет специальный символ `idle` для пропуска выполнения запросов:

```ts
import {idle} from '@gravity-ui/data-source';

const UserProfile: React.FC<{userId?: number}> = ({userId}) => {
  // Запрос не будет выполнен, если userId не определен
  const {data, status} = useQueryData(userDataSource, userId ? {userId} : idle);

  return (
    <DataLoader status={status} error={null}>
      {data && <UserCard user={data} />}
    </DataLoader>
  );
};
```

Когда параметры равны `idle`:

- Запрос не выполняется
- Статус остается `success`
- Данные остаются `undefined`
- Компонент может безопасно рендериться без загрузки

**Преимущества `idle`:**

1. **Типобезопасность** - TypeScript правильно выводит типы для условных параметров
2. **Производительность** - избегает ненужных запросов к серверу
3. **Простота логики** - не нужно дополнительно управлять состоянием `enabled`
4. **Консистентность** - унифицированный подход для всех условных запросов

Это особенно полезно для условных запросов, когда вы хотите загружать данные только при определенных условиях, сохраняя при этом типобезопасность.

## Справочник API

### Создание источников данных

#### `makePlainQueryDataSource(config)`

Создает простой источник данных запросов для простых паттернов запрос/ответ.

```ts
const dataSource = makePlainQueryDataSource({
  name: 'unique-name',
  fetch: skipContext(fetchFunction),
  transformParams: (params) => transformedRequest,
  transformResponse: (response) => transformedData,
  tags: (params) => ['tag1', 'tag2'],
  options: {
    staleTime: 60000,
    retry: 3,
    // ... другие опции react-query
  },
});
```

**Параметры:**

- `name` - Уникальный идентификатор для источника данных
- `fetch` - Функция, которая выполняет фактическую загрузку данных
- `transformParams` (опционально) - Преобразование входных параметров перед запросом
- `transformResponse` (опционально) - Преобразование данных ответа
- `tags` (опционально) - Генерация тегов кеша для инвалидации
- `options` (опционально) - Опции React Query

#### `makeInfiniteQueryDataSource(config)`

Создает бесконечный источник данных запросов для пагинации и паттернов бесконечной прокрутки.

```ts
const infiniteDataSource = makeInfiniteQueryDataSource({
  name: 'infinite-data',
  fetch: skipContext(fetchFunction),
  next: (lastPage, allPages) => nextPageParam || undefined,
  prev: (firstPage, allPages) => prevPageParam || undefined,
  // ... другие опции те же, что и для простого
});
```

**Дополнительные параметры:**

- `next` - Функция для определения параметров следующей страницы
- `prev` (опционально) - Функция для определения параметров предыдущей страницы

### React хуки

#### `useQueryData(dataSource, params, options?)`

Основной хук для загрузки данных с источником данных.

```ts
const {data, status, error, refetch, ...rest} = useQueryData(
  userDataSource,
  {userId: 123},
  {
    enabled: true,
    refetchInterval: 30000,
  },
);
```

**Возвращает:**

- `data` - Загруженные данные
- `status` - Текущий статус ('loading' | 'success' | 'error')
- `error` - Объект ошибки, если запрос не удался
- `refetch` - Функция для ручной перезагрузки данных
- Другие свойства React Query

#### `useQueryResponses(responses)`

Объединяет несколько ответов запросов в одно состояние.

```ts
const user = useQueryData(userDataSource, {userId});
const posts = useQueryData(postsDataSource, {userId});

const {status, error, refetch, refetchErrored} = useQueryResponses([user, posts]);
```

**Возвращает:**

- `status` - Объединенный статус всех запросов
- `error` - Первая встреченная ошибка
- `refetch` - Функция для перезагрузки всех запросов
- `refetchErrored` - Функция для перезагрузки только неудачных запросов

#### `useRefetchAll(states)`

Создает callback для перезагрузки нескольких запросов.

```ts
const refetchAll = useRefetchAll([user, posts, comments]);
// refetchAll() запустит refetch для всех запросов
```

#### `useRefetchErrored(states)`

Создает callback для перезагрузки только неудачных запросов.

```ts
const refetchErrored = useRefetchErrored([user, posts, comments]);
// refetchErrored() перезагрузит только запросы с ошибками
```

#### `useDataManager()`

Возвращает DataManager из контекста.

```ts
const dataManager = useDataManager();
await dataManager.invalidateTag('users');
```

#### `useQueryContext()`

Возвращает контекст запроса (для создания кастомных хуков данных на основе react-query).

### React компоненты

#### `<DataLoader />`

Компонент для обработки состояний загрузки и ошибок.

```tsx
<DataLoader
  status={status}
  error={error}
  errorAction={refetch}
  LoadingView={SpinnerComponent}
  ErrorView={ErrorComponent}
  loadingViewProps={{size: 'large'}}
  errorViewProps={{showDetails: true}}
>
  {data && <YourContent data={data} />}
</DataLoader>
```

**Props:**

- `status` - Текущий статус загрузки
- `error` - Объект ошибки
- `errorAction` - Функция или конфигурация действия для повтора при ошибке
- `LoadingView` - Компонент для отображения во время загрузки
- `ErrorView` - Компонент для отображения при ошибке
- `loadingViewProps` - Props, передаваемые в LoadingView
- `errorViewProps` - Props, передаваемые в ErrorView

#### `<DataInfiniteLoader />`

Специализированный компонент для бесконечных запросов.

```tsx
<DataInfiniteLoader
  status={status}
  error={error}
  hasNextPage={hasNextPage}
  fetchNextPage={fetchNextPage}
  isFetchingNextPage={isFetchingNextPage}
  LoadingView={SpinnerComponent}
  ErrorView={ErrorComponent}
  MoreView={LoadMoreButton}
>
  {data.map((item) => (
    <Item key={item.id} data={item} />
  ))}
</DataInfiniteLoader>
```

**Дополнительные Props:**

- `hasNextPage` - Доступны ли еще страницы
- `fetchNextPage` - Функция для загрузки следующей страницы
- `isFetchingNextPage` - Загружается ли следующая страница
- `MoreView` - Компонент для кнопки "загрузить еще"

#### `withDataManager(Component)`

HOC, который инжектирует DataManager как prop.

```tsx
const MyComponent = withDataManager<Props>(({dataManager, ...props}) => {
  // Компонент имеет доступ к dataManager
  return <div>...</div>;
});
```

### Управление данными

#### `ClientDataManager`

Основной класс для управления данными.

```ts
const dataManager = new ClientDataManager({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 минут
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Методы:**

##### `invalidateTag(tag, options?)`

Инвалидация всех запросов с определенным тегом.

```ts
await dataManager.invalidateTag('users');
await dataManager.invalidateTag('posts', {
  repeat: {count: 3, interval: 1000}, // Повтор инвалидации
});
```

##### `invalidateTags(tags, options?)`

Инвалидация запросов, которые имеют все указанные теги.

```ts
await dataManager.invalidateTags(['user', 'profile']);
```

##### `invalidateSource(dataSource, options?)`

Инвалидация всех запросов для источника данных.

```ts
await dataManager.invalidateSource(userDataSource);
```

##### `invalidateParams(dataSource, params, options?)`

Инвалидация конкретного запроса с точными параметрами.

```ts
await dataManager.invalidateParams(userDataSource, {userId: 123});
```

##### `resetSource(dataSource)`

Сброс (очистка) всех кешированных данных для источника данных.

```ts
await dataManager.resetSource(userDataSource);
```

##### `resetParams(dataSource, params)`

Сброс кешированных данных для конкретных параметров.

```ts
await dataManager.resetParams(userDataSource, {userId: 123});
```

##### `invalidateSourceTags(dataSource, params, options?)`

Инвалидация запросов на основе тегов, сгенерированных источником данных.

```ts
await dataManager.invalidateSourceTags(userDataSource, {userId: 123});
```

### Утилиты

#### `skipContext(fetchFunction)`

Утилита для адаптации существующих функций загрузки к интерфейсу источника данных.

```ts
// Существующая функция
async function fetchUser(params: {userId: number}) {
  // ...
}

// Адаптированная для источника данных
const dataSource = makePlainQueryDataSource({
  name: 'user',
  fetch: skipContext(fetchUser), // Пропускает параметры context и fetchContext
});
```

#### `withCatch(fetchFunction, errorHandler)`

Добавляет стандартизированную обработку ошибок к функциям загрузки.

```ts
const safeFetch = withCatch(fetchUser, (error) => ({error: true, message: error.message}));
```

#### `withCancellation(fetchFunction)`

Добавляет поддержку отмены к функциям загрузки.

```ts
const cancellableFetch = withCancellation(fetchFunction);
// Автоматически обрабатывает AbortSignal от React Query
```

#### `getProgressiveRefetch(options)`

Создает функцию прогрессивного интервала перезагрузки.

```ts
const progressiveRefetch = getProgressiveRefetch({
  minInterval: 1000, // Начать с 1 секунды
  maxInterval: 30000, // Максимум 30 секунд
  multiplier: 2, // Удваивать каждый раз
});

const dataSource = makePlainQueryDataSource({
  name: 'data',
  fetch: skipContext(fetchData),
  options: {
    refetchInterval: progressiveRefetch,
  },
});
```

#### `normalizeStatus(status, fetchStatus)`

Преобразует статусы React Query в статус DataLoader.

```ts
const status = normalizeStatus('pending', 'fetching'); // 'loading'
```

#### Утилиты статусов и ошибок

```ts
// Получить объединенный статус из нескольких состояний
const status = getStatus([user, posts, comments]);

// Получить первую ошибку из нескольких состояний
const error = getError([user, posts, comments]);

// Объединить несколько статусов
const combinedStatus = mergeStatuses(['loading', 'success', 'error']); // 'error'

// Проверить, есть ли у ключа запроса тег
const hasUserTag = hasTag(queryKey, 'users');
```

#### Константы

```ts
import {idle} from '@gravity-ui/data-source';

// Специальный символ для пропуска выполнения запросов
const params = shouldFetch ? {userId: 123} : idle;

// Типобезопасная альтернатива enabled: false
// Вместо:
const {data} = useQueryData(userDataSource, {userId: userId || ''}, {enabled: Boolean(userId)});

// Используйте:
const {data} = useQueryData(userDataSource, userId ? {userId} : idle);
// TypeScript корректно выводит типы для обеих веток
```

#### Утилиты композиции ключей

```ts
// Составить ключ кеша для источника данных
const key = composeKey(userDataSource, {userId: 123});

// Составить полный ключ, включая теги
const fullKey = composeFullKey(userDataSource, {userId: 123});
```

#### Композиция опций запросов

```ts
// Составить опции React Query для простых запросов
const plainOptions = composePlainQueryOptions(context, dataSource, params, options);

// Составить опции React Query для бесконечных запросов
const infiniteOptions = composeInfiniteQueryOptions(context, dataSource, params, options);
```

**Примечание:** Эти функции в основном для внутреннего использования при создании кастомных реализаций источников данных.

## Продвинутые паттерны

### Условные запросы с idle

Используйте `idle` для создания условных запросов:

```ts
import {idle} from '@gravity-ui/data-source';

const ConditionalDataComponent: React.FC<{
  userId?: number;
  shouldLoadPosts: boolean;
}> = ({userId, shouldLoadPosts}) => {
  // Загружать пользователя только если userId определен
  const user = useQueryData(
    userDataSource,
    userId ? {userId} : idle
  );

  // Загружать посты только если пользователь загружен и включен флаг
  const posts = useQueryData(
    userPostsDataSource,
    user.data && shouldLoadPosts ? {userId: user.data.id} : idle
  );

  const combined = useQueryResponses([user, posts]);

  return (
    <DataLoader status={combined.status} error={combined.error}>
      <div>
        {user.data && <UserInfo user={user.data} />}
        {posts.data && <UserPosts posts={posts.data} />}
      </div>
    </DataLoader>
  );
};
```

### Преобразование данных

Преобразование параметров запроса и данных ответа:

```ts
const apiDataSource = makePlainQueryDataSource({
  name: 'api-data',
  transformParams: (params: {id: number}) => ({
    userId: params.id,
    apiVersion: 'v2',
    format: 'json',
  }),
  transformResponse: (response: ApiResponse) => ({
    user: response.data.user,
    metadata: response.meta,
  }),
  fetch: skipContext(apiFetch),
});
```

### Инвалидация кеша на основе тегов

Используйте теги для сложного управления кешем:

```ts
const userDataSource = makePlainQueryDataSource({
  name: 'user',
  tags: (params) => [`user:${params.userId}`, 'users', 'profiles'],
  fetch: skipContext(fetchUser),
});

const userPostsDataSource = makePlainQueryDataSource({
  name: 'user-posts',
  tags: (params) => [`user:${params.userId}`, 'posts'],
  fetch: skipContext(fetchUserPosts),
});

// Инвалидировать все данные для конкретного пользователя
await dataManager.invalidateTag('user:123');

// Инвалидировать все данные, связанные с пользователями
await dataManager.invalidateTag('users');
```

### Обработка ошибок с типами

Создайте типобезопасную обработку ошибок:

```ts
interface ApiError {
  code: number;
  message: string;
  details?: Record<string, unknown>;
}

const ErrorView: React.FC<ErrorViewProps<ApiError>> = ({error, action}) => (
  <div className="error">
    <h3>Ошибка {error?.code}</h3>
    <p>{error?.message}</p>
    {action && (
      <button onClick={action.handler}>
        {action.children || 'Повторить'}
      </button>
    )}
  </div>
);
```

### Бесконечные запросы со сложной пагинацией

Обработка сложных сценариев пагинации:

```ts
interface PaginationParams {
  cursor?: string;
  limit?: number;
  filters?: Record<string, unknown>;
}

interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

const infiniteDataSource = makeInfiniteQueryDataSource({
  name: 'paginated-data',
  fetch: skipContext(async (params: PaginationParams) => {
    const response = await fetch(`/api/data?${new URLSearchParams(params)}`);
    return response.json() as PaginatedResponse<DataItem>;
  }),
  next: (lastPage) => {
    if (lastPage.hasMore && lastPage.nextCursor) {
      return {cursor: lastPage.nextCursor, limit: 20};
    }
    return undefined;
  },
});
```

### Объединение нескольких источников данных

Объединение данных из нескольких источников:

```ts
const UserProfile: React.FC<{userId: number}> = ({userId}) => {
  const user = useQueryData(userDataSource, {userId});
  const posts = useQueryData(userPostsDataSource, {userId});
  const followers = useQueryData(userFollowersDataSource, {userId});

  const combined = useQueryResponses([user, posts, followers]);

  return (
    <DataLoader
      status={combined.status}
      error={combined.error}
      errorAction={combined.refetchErrored} // Повторить только неудачные запросы
      LoadingView={ProfileSkeleton}
      ErrorView={ProfileError}
    >
      {user && posts && followers && (
        <div>
          <UserInfo user={user.data} />
          <UserPosts posts={posts.data} />
          <UserFollowers followers={followers.data} />
        </div>
      )}
    </DataLoader>
  );
};
```

## Нормализация данных

Data Source предоставляет встроенную нормализацию данных с использованием [@normy/core](https://github.com/klis87/normy). Нормализация помогает управлять реляционными данными, храня сущности по их ID и автоматически обновляя все связанные запросы при изменении данных.

### Зачем нужна нормализация?

Без нормализации одна и та же сущность может дублироваться в нескольких запросах. Когда вы обновляете эту сущность в одном месте, другие запросы остаются устаревшими до повторной загрузки. Нормализация решает эту проблему:

1. **Хранение сущностей один раз** - Каждая сущность хранится по её ID в нормализованном хранилище
2. **Автоматические обновления** - При изменении сущности все запросы, использующие её, автоматически обновляются
3. **Консистентность** - Ваш UI всегда отображает актуальные данные во всех компонентах
4. **Экономия памяти** - Нет дублирования одних и тех же данных

### Настройка с DataSourceProvider

Самый простой способ включить нормализацию - использовать `DataSourceProvider`:

```tsx
import {ClientDataManager, DataSourceProvider} from '@gravity-ui/data-source';

const dataManager = new ClientDataManager({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <DataSourceProvider
      dataManager={dataManager}
      normalizerConfig={{
        normalize: true, // Включить нормализацию глобально
        // Опционально: настройки @normy/core
        structuralSharing: true,
      }}
      optimisticUpdateConfig={{
        enabled: true, // Включить оптимистичные обновления
        autoCalculateRollback: true, // Автоматически рассчитывать данные для отката
        devLogging: false, // Включить debug логирование в разработке
      }}
    >
      <YourApplication />
    </DataSourceProvider>
  );
}
```

`DataSourceProvider` - это удобная обертка, которая объединяет:

- `QueryNormalizerProvider` - Обрабатывает нормализацию данных
- `QueryClientProvider` - Провайдер React Query
- `DataManagerContext.Provider` - Контекст Data Source

### Ручная настройка с QueryNormalizerProvider

Для большего контроля можно настроить провайдеры вручную:

```tsx
import {QueryClientProvider} from '@tanstack/react-query';
import {
  ClientDataManager,
  DataManagerContext,
  QueryNormalizerProvider,
} from '@gravity-ui/data-source';

function App() {
  return (
    <QueryNormalizerProvider
      queryClient={dataManager.queryClient}
      normalizerConfig={{normalize: true}}
      optimisticUpdateConfig={{enabled: true}}
    >
      <QueryClientProvider client={dataManager.queryClient}>
        <DataManagerContext.Provider value={dataManager}>
          <YourApplication />
        </DataManagerContext.Provider>
      </QueryClientProvider>
    </QueryNormalizerProvider>
  );
}
```

### Настройка источников данных для нормализации

Вы можете включать/выключать нормализацию для конкретного источника данных или запроса:

```ts
const userDataSource = makePlainQueryDataSource({
  name: 'user',
  fetch: skipContext(fetchUser),
  options: {
    normalizationConfig: {
      normalize: true, // Переопределить глобальную настройку для этого источника
    },
  },
});

// В компоненте - переопределить для конкретного запроса
const {data} = useQueryData(
  userDataSource,
  {userId: 123},
  {
    normalizationConfig: {
      normalize: false, // Отключить нормализацию для этого конкретного запроса
    },
  },
);
```

### Оптимистичные обновления

Оптимистичные обновления позволяют обновить UI немедленно до ответа сервера, обеспечивая мгновенную обратную связь:

```tsx
import {useMutation} from '@tanstack/react-query';
import {useQueryNormalizer} from '@gravity-ui/data-source';

function UserProfile() {
  const queryNormalizer = useQueryNormalizer();

  const mutation = useMutation({
    mutationFn: updateUser,
    onMutate: async (newUser) => {
      // Вернуть оптимистичные данные, которые будут автоматически применены
      return {
        optimisticData: {
          users: {
            [newUser.id]: newUser,
          },
        },
      };
    },
    // Откат рассчитывается автоматически если autoCalculateRollback: true
    // Иначе вы можете предоставить его вручную:
    onMutate: async (newUser) => {
      const currentUser = queryNormalizer.getObjectById('users', newUser.id);
      return {
        optimisticData: {
          users: {[newUser.id]: newUser},
        },
        rollbackData: {
          users: {[newUser.id]: currentUser},
        },
      };
    },
    // Настройка для конкретной мутации
    optimisticUpdateConfig: {
      enabled: true,
      devLogging: true,
    },
  });
}
```

### Работа с нормализованными данными

`QueryNormalizerProvider` предоставляет хук `useQueryNormalizer` с вспомогательными методами:

```tsx
import {useQueryNormalizer} from '@gravity-ui/data-source';

function MyComponent() {
  const queryNormalizer = useQueryNormalizer();

  // Получить все нормализованные данные
  const normalizedData = queryNormalizer.getNormalizedData();

  // Получить конкретную сущность по ID
  const user = queryNormalizer.getObjectById('users', '123');

  // Получить фрагмент данных
  const fragment = queryNormalizer.getQueryFragment({
    users: {
      '123': {id: true, name: true},
    },
  });

  // Найти запросы, зависящие от конкретных данных
  const dependentQueries = queryNormalizer.getDependentQueries({
    users: {
      '123': {id: '123', name: 'Updated Name'},
    },
  });

  // Найти запросы по ID сущностей
  const queries = queryNormalizer.getDependentQueriesByIds(['users.123', 'posts.456']);

  // Вручную обновить нормализованные данные (например, из WebSocket)
  queryNormalizer.setNormalizedData({
    users: {
      '123': {id: '123', name: 'Real-time Update'},
    },
  });

  // Очистить все нормализованные данные
  queryNormalizer.clear();
}
```

### Пример real-time обновлений

Нормализация отлично работает с WebSocket или другими real-time обновлениями:

```tsx
import {useEffect} from 'react';
import {useQueryNormalizer} from '@gravity-ui/data-source';

function useWebSocketUpdates() {
  const queryNormalizer = useQueryNormalizer();

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/updates');

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      // Автоматически обновляет все запросы, использующие эти данные
      queryNormalizer.setNormalizedData(update);
    };

    return () => ws.close();
  }, [queryNormalizer]);
}
```

### Справочник по конфигурации

#### NormalizerConfig

```ts
interface DataSourceNormalizerConfig {
  /** Включена ли нормализация, по умолчанию false */
  normalize?: boolean;

  // Опции конфигурации @normy/core:
  /** Использовать ли структурное разделение для обновлений */
  structuralSharing?: boolean;
  /** Пользовательские схемы нормализации */
  schemas?: Record<string, NormalizationSchema>;
  /** Пользовательское имя поля ID (по умолчанию: 'id') */
  idAttribute?: string;
}
```

#### OptimisticUpdateConfig

```ts
interface OptimisticUpdateConfig {
  /** Включена ли оптимистичная синхронизация, по умолчанию false. Внимание: не будет работать без нормализации */
  enabled?: boolean;
  /** Автоматически рассчитывать данные для отката, по умолчанию true */
  autoCalculateRollback?: boolean;
  /** Включено ли debug логирование */
  devLogging?: boolean;
}
```

### Лучшие практики

1. **Включайте глобально, отключайте выборочно** - Включите нормализацию на уровне провайдера, отключайте только для конкретных запросов, которым она не нужна
2. **Используйте консистентные структуры сущностей** - Убедитесь, что ваш API возвращает сущности с консистентными полями ID
3. **Используйте оптимистичные обновления** - Для лучшего UX используйте оптимистичные обновления с автоматическим откатом
4. **Мониторьте в разработке** - Включите `devLogging` во время разработки, чтобы понимать поведение нормализации
5. **Комбинируйте с тегами** - Используйте и нормализацию, и теги для комплексного управления кешем

## Поддержка TypeScript

Библиотека построена с TypeScript-first подходом и обеспечивает полный вывод типов:

```ts
// Типы автоматически выводятся
const userDataSource = makePlainQueryDataSource({
  name: 'user',
  fetch: skipContext(async (params: {userId: number}): Promise<User> => {
    // Тип возврата выводится как User
  }),
});

// Тип возврата хука автоматически типизирован
const {data} = useQueryData(userDataSource, {userId: 123});
// data типизирован как User | undefined
```

### Кастомные типы ошибок

Определение и использование кастомных типов ошибок:

```ts
interface ValidationError {
  field: string;
  message: string;
}

interface ApiError {
  type: 'network' | 'validation' | 'server';
  message: string;
  validation?: ValidationError[];
}

const typedDataSource = makePlainQueryDataSource<
  {id: number}, // Тип параметров
  {id: number}, // Тип запроса
  ApiResponse, // Тип ответа
  User, // Тип данных
  ApiError // Тип ошибки
>({
  name: 'typed-user',
  fetch: skipContext(fetchUser),
});
```

## Содействие проекту

Пожалуйста, прочтите [CONTRIBUTING.md](CONTRIBUTING.md) для получения информации о нашем кодексе поведения и процессе отправки pull request'ов.

## Лицензия

MIT License. См. файл [LICENSE](LICENSE) для деталей.
