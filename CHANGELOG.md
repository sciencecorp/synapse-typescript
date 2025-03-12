# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0](https://github.com/sciencecorp/synapse-typescript/compare/v0.12.0...v1.0.0) (2025-03-12)


### ⚠ BREAKING CHANGES

* return 'Status' from Device and Config API methods

### Features

* add BroadbandSource, SpikeSource nodes ([#10](https://github.com/sciencecorp/synapse-typescript/issues/10)) ([a47abff](https://github.com/sciencecorp/synapse-typescript/commit/a47abff87ed7ea001f95841cfd1b95990f11730a))
* add Config.fromProto method ([7bbbb7e](https://github.com/sciencecorp/synapse-typescript/commit/7bbbb7ea6dfad57b65d0338185dc066b28c89b5b))
* add Device, Config classes ([70b53af](https://github.com/sciencecorp/synapse-typescript/commit/70b53afe175d6c7c7e7329ea6c1b9eb2760ad4c2))
* add Device.getLogs, Device.tailLog RPCs ([#19](https://github.com/sciencecorp/synapse-typescript/issues/19)) ([43719e8](https://github.com/sciencecorp/synapse-typescript/commit/43719e819157b7ccb43ffccc927a26704fda7064))
* add discover method ([d9bcda3](https://github.com/sciencecorp/synapse-typescript/commit/d9bcda3aed39f6c38f6d53af99a8a7a4a7b46d0b))
* add options to all calls (deadline), update protos ([#7](https://github.com/sciencecorp/synapse-typescript/issues/7)) ([23b1e3d](https://github.com/sciencecorp/synapse-typescript/commit/23b1e3da3b3e79f4cb9da7bc11e631a99e67c408))
* add Status obj, return status from Device and Config calls ([#17](https://github.com/sciencecorp/synapse-typescript/issues/17)) ([c925f43](https://github.com/sciencecorp/synapse-typescript/commit/c925f436e23226be78421986e8f3172c8b89aa35))
* add StreamIn, StreamOut, ElectricalBroadband, OpticalStim nodes ([b0d8499](https://github.com/sciencecorp/synapse-typescript/commit/b0d84994e3ec114499cb053e6595c214a53ae55e))
* add synapse-api proto generation ([a6d1b3e](https://github.com/sciencecorp/synapse-typescript/commit/a6d1b3e5a48816083fd2a83297f6c59b8a5f5d70))
* convert StreamOut / StreamIn nodes to UDP, support unicast & multicast ([b5c1bf7](https://github.com/sciencecorp/synapse-typescript/commit/b5c1bf714bfd0ef1c8b1e57574494d69fee4097d))
* export proto types, add barrel file for exports from root of pkg ([271a6f2](https://github.com/sciencecorp/synapse-typescript/commit/271a6f29de11b00cb5c3cf6c1b8cce2db39284da))
* export types and enums from root index ([d2654ad](https://github.com/sciencecorp/synapse-typescript/commit/d2654adcdb9fac6e236c69259d088929baffdd2e))
* init ([4567bab](https://github.com/sciencecorp/synapse-typescript/commit/4567babe067a6a800cec0a5ac22733f494d8acb5))
* rename npm package to @sciencecorp/synapse ([a3e7518](https://github.com/sciencecorp/synapse-typescript/commit/a3e75187083257e9c93cbfa68769b89db904aa01))
* update discovery implementation ([#9](https://github.com/sciencecorp/synapse-typescript/issues/9)) ([220e472](https://github.com/sciencecorp/synapse-typescript/commit/220e47268382f7ac34a70848d000f8f301d8f342))
* update ElectricalBroadband, OpticalStim node construction via config, ChannelMask ([378a8e8](https://github.com/sciencecorp/synapse-typescript/commit/378a8e83a9c46dbfc9a837e03ac3d7d3fd80cbec))
* update StreamIn, StreamOut nodes ([520d862](https://github.com/sciencecorp/synapse-typescript/commit/520d862add3fbbab0c5c76da768129724257d9a6))
* update StreamIn, StreamOut nodes to use UDP ([28ca165](https://github.com/sciencecorp/synapse-typescript/commit/28ca1654ab80a614b1babc4a5bf8bec9f2f57761))


### Bug Fixes

* correctly export enums ([dd910bb](https://github.com/sciencecorp/synapse-typescript/commit/dd910bb6821be2973db3c6d3deb4072210894ebf))
* device ingests socket information on info() call ([#5](https://github.com/sciencecorp/synapse-typescript/issues/5)) ([e21c6c2](https://github.com/sciencecorp/synapse-typescript/commit/e21c6c240858ae09a6d2e05b63e97bdd3be066a0))
* fix config node creation from DeviceConfiguration proto ([e2fb9c1](https://github.com/sciencecorp/synapse-typescript/commit/e2fb9c1cc1a56a0a8e49684e9c080d7940c45600))
* fix finding socket for Stream nodes ([1990ab3](https://github.com/sciencecorp/synapse-typescript/commit/1990ab3ad530b1f752624dfeb7b630bb78d155a8))
* fix installation of package (postinstall hook) by falling back to synapse-api zip download if submodule not available ([#11](https://github.com/sciencecorp/synapse-typescript/issues/11)) ([f06f4d1](https://github.com/sciencecorp/synapse-typescript/commit/f06f4d170800f36d85aa80c3e47bdfbbd7d69551))
* fix issue where Info() would return error status on successful call with device error status ([#14](https://github.com/sciencecorp/synapse-typescript/issues/14)) ([4e9fe47](https://github.com/sciencecorp/synapse-typescript/commit/4e9fe471c19906652e9931dc34397f9c4df805b0))
* improve packaging - bundle proto json definition instead of loading protos at runtime ([78966fc](https://github.com/sciencecorp/synapse-typescript/commit/78966fcfb3d8d8f31a1afa66e37382c1911d02d3))
* protobuf response parsing, by switching back to proto-loader... ([9a1a655](https://github.com/sciencecorp/synapse-typescript/commit/9a1a65594baf5313fb54ee5ba36cf02dfbb72470))
* replace 'shape' field in stream-in node ([#4](https://github.com/sciencecorp/synapse-typescript/issues/4)) ([bf84021](https://github.com/sciencecorp/synapse-typescript/commit/bf8402159305e3fdbc5ee959dc93a91d27dfbef4))
* sha parsing and rate limiting on postinstall script ([#15](https://github.com/sciencecorp/synapse-typescript/issues/15)) ([11d6aec](https://github.com/sciencecorp/synapse-typescript/commit/11d6aec97154e6485e2f9588ad274d69bf57c9f4))
* status / error parsing (code enum); lint ([67e9693](https://github.com/sciencecorp/synapse-typescript/commit/67e9693cfe97939e85b957b8780f066b693d1a52))

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
