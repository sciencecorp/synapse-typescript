# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.1](https://github.com/sciencecorp/synapse-typescript/compare/v1.0.0...v1.0.1) (2025-03-26)

## [1.0.0](https://github.com/sciencecorp/synapse-typescript/compare/synapse-v0.12.0...synapse-v1.0.0) (2025-03-25)


### ⚠ BREAKING CHANGES

* migrate StreamOut from UDP multicast to UDP unicast
* return 'Status' from Device and Config API methods

### Features

* add Device.getLogs, Device.tailLog RPCs ([#19](https://github.com/sciencecorp/synapse-typescript/issues/19)) ([43719e8](https://github.com/sciencecorp/synapse-typescript/commit/43719e819157b7ccb43ffccc927a26704fda7064))
* add Status obj, return status from Device and Config calls ([#17](https://github.com/sciencecorp/synapse-typescript/issues/17)) ([c925f43](https://github.com/sciencecorp/synapse-typescript/commit/c925f436e23226be78421986e8f3172c8b89aa35))
* **disk-writer:** add DiskWriter node ([1a40373](https://github.com/sciencecorp/synapse-typescript/commit/1a4037355fcd846b25de93b53416119569ca0e22))
* support udp unicast in StreamOut node ([#27](https://github.com/sciencecorp/synapse-typescript/issues/27)) ([a175fd1](https://github.com/sciencecorp/synapse-typescript/commit/a175fd1fb79b6d9c30769a13d0d71fa3873b6718))


### Bug Fixes

* sha parsing and rate limiting on postinstall script ([#15](https://github.com/sciencecorp/synapse-typescript/issues/15)) ([11d6aec](https://github.com/sciencecorp/synapse-typescript/commit/11d6aec97154e6485e2f9588ad274d69bf57c9f4))

## [0.13.0](https://github.com/sciencecorp/synapse-typescript/compare/v0.12.0...v0.13.0) (2025-03-13)


### Features

* **disk-writer:** add DiskWriter node ([5274dd8](https://github.com/sciencecorp/synapse-typescript/commit/5274dd8ece541e388811c2a8e06b4919e1451c5a))

## [0.12.0](https://github.com/sciencecorp/synapse-typescript/compare/v0.11.1...v0.12.0) (2025-03-06)


### ⚠ BREAKING CHANGES

* return 'Status' from Device and Config API methods

### Features

* add Device.getLogs, Device.tailLog RPCs ([#19](https://github.com/sciencecorp/synapse-typescript/issues/19)) ([43719e8](https://github.com/sciencecorp/synapse-typescript/commit/43719e819157b7ccb43ffccc927a26704fda7064))
* add Status obj, return status from Device and Config calls ([#17](https://github.com/sciencecorp/synapse-typescript/issues/17)) ([c925f43](https://github.com/sciencecorp/synapse-typescript/commit/c925f436e23226be78421986e8f3172c8b89aa35))


### Bug Fixes

* sha parsing and rate limiting on postinstall script ([#15](https://github.com/sciencecorp/synapse-typescript/issues/15)) ([11d6aec](https://github.com/sciencecorp/synapse-typescript/commit/11d6aec97154e6485e2f9588ad274d69bf57c9f4))

### [0.11.1](https://github.com/sciencecorp/synapse-typescript/compare/v0.11.0...v0.11.1) (2025-02-11)


### Bug Fixes

* fix issue where Info() would return error status on successful call with device error status ([#14](https://github.com/sciencecorp/synapse-typescript/issues/14)) ([4e9fe47](https://github.com/sciencecorp/synapse-typescript/commit/4e9fe471c19906652e9931dc34397f9c4df805b0))

## [0.11.0](https://github.com/sciencecorp/synapse-typescript/compare/v0.10.0...v0.11.0) (2025-02-07)


### Features

* add BroadbandSource, SpikeSource nodes ([#10](https://github.com/sciencecorp/synapse-typescript/issues/10)) ([6175d17](https://github.com/sciencecorp/synapse-typescript/commit/6175d1726784c194a154e1a9154bd6841b7073f7))
* update discovery implementation ([#9](https://github.com/sciencecorp/synapse-typescript/issues/9)) ([220e472](https://github.com/sciencecorp/synapse-typescript/commit/220e47268382f7ac34a70848d000f8f301d8f342))


### Bug Fixes

* fix installation of package (postinstall hook) by falling back to synapse-api zip download if submodule not available ([#11](https://github.com/sciencecorp/synapse-typescript/issues/11)) ([f06f4d1](https://github.com/sciencecorp/synapse-typescript/commit/f06f4d170800f36d85aa80c3e47bdfbbd7d69551))

## [0.10.0](https://github.com/sciencecorp/synapse-typescript/compare/v0.9.0...v0.10.0) (2025-01-15)


### Features

* add options to all calls (deadline), update protos ([#7](https://github.com/sciencecorp/synapse-typescript/issues/7)) ([23b1e3d](https://github.com/sciencecorp/synapse-typescript/commit/23b1e3da3b3e79f4cb9da7bc11e631a99e67c408))


### Bug Fixes

* device ingests socket information on info() call ([#5](https://github.com/sciencecorp/synapse-typescript/issues/5)) ([e21c6c2](https://github.com/sciencecorp/synapse-typescript/commit/e21c6c240858ae09a6d2e05b63e97bdd3be066a0))
* replace 'shape' field in stream-in node ([#4](https://github.com/sciencecorp/synapse-typescript/issues/4)) ([bf84021](https://github.com/sciencecorp/synapse-typescript/commit/bf8402159305e3fdbc5ee959dc93a91d27dfbef4))
