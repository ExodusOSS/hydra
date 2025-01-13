# Build instructions

## `app-bitcoin-new`

1. Pull ledger build docker

```bash
docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder-lite:latest
```

2. Clone the git repository

```bash
git clone https://github.com/LedgerHQ/app-bitcoin-new.git
```

3. Now enter the matrix

```bash
docker run --rm -it -v $(pwd)/app-bitcoin-new:/app-bitcoin-new ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder-lite /bin/bash
```

4. Build bitcoin app

```bash
cd /app-bitcoin-new
make -j BOLOS_SDK=$NANOS_SDK COIN=bitcoin DEBUG=1
make -j BOLOS_SDK=$NANOX_SDK COIN=bitcoin DEBUG=1
make -j BOLOS_SDK=$NANOSP_SDK COIN=bitcoin DEBUG=1
make -j BOLOS_SDK=$STAX_SDK COIN=bitcoin DEBUG=1
```

## `app-solana`

1. Pull the docker image

```bash
docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder
```

2. Tag the docker image

```bash
docker image tag ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder ledger-app-builder
```

3. Clone the `app-solana` source code, checkout the correct tag (or master) and change the current working directory to the repo you just cloned

```bash
git clone https://github.com/LedgerHQ/app-solana.git
cd app-solana
# git checkout master # if you want latest release
```

Or if you want stax support

```bash
git clone https://github.com/kewde/app-solana.git
cd app-solana
git checkout kewde/stax-docker
```

4. Build the `app.elf`

```bash
./docker-make s # Nano S
#./docker-make x # Nano X
#./docker-make sp # Nano S plus
#./docker-make stax # Stax
```

5. If needed, clean the build files

```bash
./docker-make clean
```

## `app-ethereum`

1. Pull ledger build docker

```bash
docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder-lite:latest
```

2. Pull source code & initialize submodules

```bash
git clone https://github.com/LedgerHQ/app-ethereum.git
cd app-ethereum
nano .gitmodules # Maybe you need to change to clone over https rather than ssh
git submodule sync
git submodule update --init --recursive
```

3. Now enter the matrix

```bash
docker run --rm -it -v $(pwd)/app-ethereum:/app-ethereum ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder-lite /bin/bash
```

4. Execute builds (`ALLOW_DATA=1` will enable blind signing by default)

```bash
cd /app-ethereum
make -j BOLOS_SDK=$NANOS_SDK ALLOW_DATA=1 DEBUG=1
make -j BOLOS_SDK=$NANOX_SDK ALLOW_DATA=1 DEBUG=1
make -j BOLOS_SDK=$NANOSP_SDK ALLOW_DATA=1 DEBUG=1
make -j BOLOS_SDK=$STAX_SDK ALLOW_DATA=1 DEBUG=1
```

5. Building an ethereum altcoin:

```bash
cd /app-ethereum
make clean
make -j BOLOS_SDK=$NANOS_SDK CHAIN=polygon ALLOW_DATA=1 DEBUG=1
make -j BOLOS_SDK=$NANOX_SDK CHAIN=polygon ALLOW_DATA=1 DEBUG=1
make -j BOLOS_SDK=$NANOSP_SDK CHAIN=polygon ALLOW_DATA=1 DEBUG=1
make -j BOLOS_SDK=$STAX_SDK CHAIN=polygon ALLOW_DATA=1 DEBUG=1
```

## `app-tron`

1. Pull ledger build docker

```bash
docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder-lite:latest
```

2. Pull source code

```bash
git clone https://github.com/LedgerHQ/app-tron.git
cd app-tron
```

3. Now enter the matrix

```bash
docker run --rm -it -v $(pwd)/app-tron:/app-tron ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder-lite /bin/bash
```

4. Execute builds

```bash
cd /app-tron
make -j BOLOS_SDK=$NANOS_SDK DEBUG=1
make -j BOLOS_SDK=$NANOX_SDK DEBUG=1
make -j BOLOS_SDK=$NANOSP_SDK DEBUG=1
make -j BOLOS_SDK=$FLEX_SDK DEBUG=1
make -j BOLOS_SDK=$STAX_SDK DEBUG=1
```
