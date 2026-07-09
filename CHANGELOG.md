# Changelog

## [0.10.0](https://github.com/gravity-ui/data-source/compare/v0.9.0...v0.10.0) (2026-07-09)


### Features

* add suspense support ([#51](https://github.com/gravity-ui/data-source/issues/51)) ([56b20f4](https://github.com/gravity-ui/data-source/commit/56b20f42e2682487d993ac157ec91558b728317b))

## [0.9.0](https://github.com/gravity-ui/data-source/compare/v0.8.2...v0.9.0) (2026-04-02)

### ⚠ BREAKING CHANGES

* `refetch` call is ignored for disabled queries
* `refetch` returns `Promise<Void>` instead of result

### Features

* refetch return Promise&lt;Void&gt; ([#45](https://github.com/gravity-ui/data-source/issues/45)) ([70d7d92](https://github.com/gravity-ui/data-source/commit/70d7d921c5eee397d0db5b244f3985874c6f898d))
* **withCatch:** avoid never[] widening union when success type is an array ([#49](https://github.com/gravity-ui/data-source/issues/49)) ([214168e](https://github.com/gravity-ui/data-source/commit/214168e718f69df90a89ae88f3a402479690ff27))

## [0.8.2](https://github.com/gravity-ui/data-source/compare/v0.8.1...v0.8.2) (2025-12-12)


### Bug Fixes

* revert "do not manual refetch disabled queries" ([#43](https://github.com/gravity-ui/data-source/issues/43)) ([ac29b67](https://github.com/gravity-ui/data-source/commit/ac29b67250a2749c584a5b74503e2c1b81f3977f))

## [0.8.1](https://github.com/gravity-ui/data-source/compare/v0.8.0...v0.8.1) (2025-12-08)


### Bug Fixes

* normy fix add update function ([#41](https://github.com/gravity-ui/data-source/issues/41)) ([74d8cce](https://github.com/gravity-ui/data-source/commit/74d8ccec6b0a0221b38d2411b305b964171a9d26))

## [0.8.0](https://github.com/gravity-ui/data-source/compare/v0.7.0...v0.8.0) (2025-12-03)

### ⚠ BREAKING CHANGES

* `refetch` call is ignored for disabled queries

### Features

* add normalize ([#40](https://github.com/gravity-ui/data-source/issues/40)) ([70b9dd4](https://github.com/gravity-ui/data-source/commit/70b9dd40755c9e1f329f4c7743d3edba3f97e6f0))


### Bug Fixes

* do not manual refetch disabled queries ([#37](https://github.com/gravity-ui/data-source/issues/37)) ([16f57eb](https://github.com/gravity-ui/data-source/commit/16f57eb7f46cad6960585d89d4b29621a52f4ba3))

## [0.7.0](https://github.com/gravity-ui/data-source/compare/v0.6.1...v0.7.0) (2025-06-02)


### Features

* add the withCatch function ([#34](https://github.com/gravity-ui/data-source/issues/34)) ([85ac92c](https://github.com/gravity-ui/data-source/commit/85ac92c4cb55b92c10af99a9d1f4cf75fb9739fe))
* remove the transformError ([#36](https://github.com/gravity-ui/data-source/issues/36)) ([01e2e9a](https://github.com/gravity-ui/data-source/commit/01e2e9a6e6af7c9e06d99add06c6db55646552cb))

## [0.6.1](https://github.com/gravity-ui/data-source/compare/v0.6.0...v0.6.1) (2025-03-25)


### Bug Fixes

* fix typo and hasTag function ([#29](https://github.com/gravity-ui/data-source/issues/29)) ([a0f1ae1](https://github.com/gravity-ui/data-source/commit/a0f1ae183d3b41b1e1b3bf0575b2f0bc3af16efb))

## [0.6.0](https://github.com/gravity-ui/data-source/compare/v0.5.1...v0.6.0) (2025-03-25)


### Features

* add the transformError data-source function ([#24](https://github.com/gravity-ui/data-source/issues/24)) ([16c1775](https://github.com/gravity-ui/data-source/commit/16c177512412d96ab14bfa9f3f88610b04f65a36))


### Bug Fixes

* add NoInfer ([#28](https://github.com/gravity-ui/data-source/issues/28)) ([c3d6c93](https://github.com/gravity-ui/data-source/commit/c3d6c93c50f1e59f558aed0dc35c797800025045))

## [0.5.1](https://github.com/gravity-ui/data-source/compare/v0.5.0...v0.5.1) (2025-03-14)


### Bug Fixes

* **react-query:** fix queryFn for useRefetchInterval ([#25](https://github.com/gravity-ui/data-source/issues/25)) ([8ba00e6](https://github.com/gravity-ui/data-source/commit/8ba00e680e4227ac9b47ebba709a2678e39b2781))

## [0.5.0](https://github.com/gravity-ui/data-source/compare/v0.4.0...v0.5.0) (2025-02-21)


### Features

* add progressive refetch interval and repeat invalidation ([#22](https://github.com/gravity-ui/data-source/issues/22)) ([c472fae](https://github.com/gravity-ui/data-source/commit/c472faed04ad70129a0ba5ce027fc079550c4e6f))

## [0.4.0](https://github.com/gravity-ui/data-source/compare/v0.3.0...v0.4.0) (2024-08-19)


### Features

* **react-query:** add memoization for data in infinite source ([#17](https://github.com/gravity-ui/data-source/issues/17)) ([1147af1](https://github.com/gravity-ui/data-source/commit/1147af1526f3969c894128cfc83694a690582a5b))

## [0.3.0](https://github.com/gravity-ui/data-source/compare/v0.2.1...v0.3.0) (2024-08-12)


### Features

* **react-query:** update to major v5 ([#13](https://github.com/gravity-ui/data-source/issues/13)) ([9e6b893](https://github.com/gravity-ui/data-source/commit/9e6b89318ce26071321e37eb720890749a3031f6))

## [0.2.1](https://github.com/gravity-ui/data-source/compare/v0.2.0...v0.2.1) (2024-08-07)


### ⚠ BREAKING CHANGES

* `next` and `prev` are `Partial<TRequest> | undefined` instead of `Partial<TResponse> | undefined`
* DataSource no longer supports in `ActualParams` type


### Bug Fixes

* make page param patch for request ([#11](https://github.com/gravity-ui/data-source/issues/11)) ([e76f88e](https://github.com/gravity-ui/data-source/commit/e76f88e8426d24c32df9615f5a678f923bb2c84e))

## [0.2.0](https://github.com/gravity-ui/data-source/compare/v0.1.2...v0.2.0) (2024-08-05)


### Features

* **react:** add custom props for data loader components ([#8](https://github.com/gravity-ui/data-source/issues/8)) ([b4d12de](https://github.com/gravity-ui/data-source/commit/b4d12dea1e94f3267732698f9f4a20aa90c6baac))

## [0.1.2](https://github.com/gravity-ui/data-source/compare/v0.1.1...v0.1.2) (2024-08-05)


### Bug Fixes

* install utlity-types package as dependency ([#6](https://github.com/gravity-ui/data-source/issues/6)) ([783c929](https://github.com/gravity-ui/data-source/commit/783c929d3945a55ef15b26df1edf20850ef780fa))

## [0.1.1](https://github.com/gravity-ui/data-source/compare/v0.1.0...v0.1.1) (2024-08-02)


### Bug Fixes

* **react:** add exports for error props ([#4](https://github.com/gravity-ui/data-source/issues/4)) ([a86c45b](https://github.com/gravity-ui/data-source/commit/a86c45b70b9119b8f276ea0140c78b3d9c02060e))

## 0.1.0 (2024-07-29)


### chore

* release 0.1.0 ([3eea73e](https://github.com/gravity-ui/data-source/commit/3eea73effce4ce197f1f8ac305211cb2919a88c5))


### Features

* add base code ([a2cfd40](https://github.com/gravity-ui/data-source/commit/a2cfd4019bc2a5f7697f6e31aa40ed30990c4117))
