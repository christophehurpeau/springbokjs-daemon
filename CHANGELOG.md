<a name="2.6.0"></a>
# [2.6.0](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.5.0...v2.6.0) (2018-04-21)

typescript


<a name="2.5.0"></a>
# [2.5.0](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.4.1...v2.5.0) (2018-03-18)


### Features

* nightingale 7 ([207998a](https://github.com/christophehurpeau/springbokjs-daemon/commit/207998a))


<a name="2.4.1"></a>
## [2.4.1](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.4.0...v2.4.1) (2018-03-04)


### Bug Fixes

* hasExited ([94f0605](https://github.com/christophehurpeau/springbokjs-daemon/commit/94f0605))


<a name="2.4.0"></a>
# [2.4.0](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.3.0...v2.4.0) (2018-03-04)


### Features

* add hasExited ([38019e9](https://github.com/christophehurpeau/springbokjs-daemon/commit/38019e9))


<a name="2.3.0"></a>
# [2.3.0](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.2.0...v2.3.0) (2017-09-07)


### Features

* option "prefixStdout" ([8d4110b](https://github.com/christophehurpeau/springbokjs-daemon/commit/8d4110b))


<a name="2.2.0"></a>
# [2.2.0](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.1.1...v2.2.0) (2017-08-31)


### Features

* update pob lib and flow-runtime ([1fa4f6c](https://github.com/christophehurpeau/springbokjs-daemon/commit/1fa4f6c))
* use graceful-kill ([90cca07](https://github.com/christophehurpeau/springbokjs-daemon/commit/90cca07))


<a name="2.1.1"></a>
## [2.1.1](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.1.0...v2.1.1) (2017-06-08)


### Bug Fixes

* update dependencies and support node 8 ([574ba13](https://github.com/christophehurpeau/springbokjs-daemon/commit/574ba13))


<a name="2.1.0"></a>
# [2.1.0](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.0.3...v2.1.0) (2017-02-27)


### Features

* pob update, add cwd argument ([a8d9d8b](https://github.com/christophehurpeau/springbokjs-daemon/commit/a8d9d8b))


<a name="2.0.3"></a>
## [2.0.3](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.0.2...v2.0.3) (2017-01-31)


### Bug Fixes

* missing stop return Promise ([f0fb991](https://github.com/christophehurpeau/springbokjs-daemon/commit/f0fb991))


<a name="2.0.2"></a>
## [2.0.2](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.0.1...v2.0.2) (2017-01-31)


### Bug Fixes

* stop called but not started ([df12161](https://github.com/christophehurpeau/springbokjs-daemon/commit/df12161))


<a name="2.0.1"></a>
## [2.0.1](https://github.com/christophehurpeau/springbokjs-daemon/compare/v2.0.0...v2.0.1) (2017-01-30)


### Bug Fixes

* autorestart ([532727d](https://github.com/christophehurpeau/springbokjs-daemon/commit/532727d))
* child message restart ([984adc8](https://github.com/christophehurpeau/springbokjs-daemon/commit/984adc8))
* env ([b595fbb](https://github.com/christophehurpeau/springbokjs-daemon/commit/b595fbb))
* nightingale config ([5d5fec7](https://github.com/christophehurpeau/springbokjs-daemon/commit/5d5fec7))
* rename autoRestart and fix SIGTERMTimeout type ([9e98dc2](https://github.com/christophehurpeau/springbokjs-daemon/commit/9e98dc2))
* spawn stdio use inherit ([27730ad](https://github.com/christophehurpeau/springbokjs-daemon/commit/27730ad))

### Features

* logger ready success and use lowercase ([b952710](https://github.com/christophehurpeau/springbokjs-daemon/commit/b952710))
* reduce log when restarting ([9cfe5b1](https://github.com/christophehurpeau/springbokjs-daemon/commit/9cfe5b1))


<a name="2.0.0"></a>
# [2.0.0](https://github.com/christophehurpeau/springbokjs-daemon/compare/v1.5.0...v2.0.0) (2017-01-30)

BREAKING CHANGES:
- new api
- drop support for node < 6
- drop support nightingale < 6


### v1.5.0

- [`4a59221`](https://github.com/christophehurpeau/springbokjs-daemon/commit/4a592214db5319f95342335a458c2951a67a2ec9) refactor: upgrade pob and add autorestart option (Christophe Hurpeau)

### v1.4.0

- [`cdf1ef9`](https://github.com/christophehurpeau/springbokjs-daemon/commit/cdf1ef9371d4e1a95180568f6cd5f20f72217a54) nightingale (Christophe Hurpeau)

### v1.3.0

- [`39a680d`](https://github.com/christophehurpeau/springbokjs-daemon/commit/39a680d6a958e04659349558d11aed136c49256b) chore(package): nightingale-logger@^1.6.0 (Christophe Hurpeau)

### v1.2.0

- [`7ef04bb`](https://github.com/christophehurpeau/springbokjs-daemon/commit/7ef04bb8bb0f237d0d7cd6f31e3f6634abb0ea4c) send SIGKILL after 4s, and add nightingale 5.0.0 support (Christophe Hurpeau)

### v1.1.1

- [`31adddd`](https://github.com/christophehurpeau/springbokjs-daemon/commit/31adddd0241ea841feff4f521e367b45036e426c) exit add signal (Christophe Hurpeau)

### v1.1.0

- [`fa41b15`](https://github.com/christophehurpeau/springbokjs-daemon/commit/fa41b155ae6c8492a2d9c8c2ad067ee1c3cbe134) exit add signal (Christophe Hurpeau)

### v1.0.1

- [`31a7b35`](https://github.com/christophehurpeau/springbokjs-daemon/commit/31a7b35214c3bbd7780e7baa4be3a1489ae17961) no more weird states (Christophe Hurpeau)

### v1.0.0

- [`b19a944`](https://github.com/christophehurpeau/springbokjs-daemon/commit/b19a94450b084b2cac5494ca80c32aa131372fea) pob, nightingale (Christophe Hurpeau)
- [`fb94b13`](https://github.com/christophehurpeau/springbokjs-daemon/commit/fb94b1397959555ed403e0ccb146315631bc97c6) update AUTHORS (Christophe Hurpeau)
