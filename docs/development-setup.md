# Development Setup

This guide assumes you have the commands `podman`, `go` (>= 1.18), `node`, `yarn`, and `make` installed/available.

Targets like `make start` will automatically fallback to the `docker` command if `podman` is not available. The container tool command can be overriden by setting the `CONTAINER_TOOL` variable.

```bash
# force podman
make start CONTAINER_TOOL=podman

# force docker
make start CONTAINER_TOOL=docker
```

### Cross-Platform Images

To build cross-platform container images you will need `qemu-user-static` installed.

If using MacOS you can do this with the following one-time commands:

```sh
podman machine ssh sudo rpm-ostree install qemu-user-static
podman machine ssh sudo systemctl reboot
```

## Database (PostgreSQL)

GoAlert is built and tested against Postgres 11. Version 9.6 should still work as of this writing, but is not recommended as future versions may begin using newer features.

The easiest way to setup Postgres for development is to run `make postgres`.
This will start a container with the correct configuration for the dev environment.

### Manual Configuration

If you already have Postgres running locally you can create the `goalert` role.

```sql
CREATE ROLE goalert WITH LOGIN SUPERUSER;
```

Currently the dev user must be a superuser to enable `pgcrypto` with `CREATE EXTENSION`.

#### Toolchain Requirements

- For the first start, run `make regendb` to migrate and add test data into the DB. This includes adding an admin user `admin/admin123`.
- To start GoAlert in development mode run `make start`.
- To build the GoAlert binary run `make bin/goalert BUNDLE=1`.

### Automated Browser Tests

To run automated browser tests, you can start Cypress in one of the following modes:

- `make cy-wide` Widescreen format, in dev mode.
- `make cy-mobile` Mobile format, in dev mode.
- `make cy-wide-prod` Widescreen format, production build.
- `make cy-mobile-prod` Mobile format, production build.

The Cypress UI should start automatically.

More information about browser tests can be found [here](../web/src/cypress/README.md).

### Running Smoketests

A suite of functional/behavioral tests are maintained for the backend code. These test various APIs and behaviors
of the GoAlert server component.

Run the full suite with `make smoketest`.

More information about smoketests can be found [here](../smoketest/README.md).

### Running Unit Tests

All unit tests can be run with `make test`.

UI Unit tests are found under the directory of the file being tested, with the same file name, appended with `.test.js`. They can be run independently of the Go unit tests with `make jest`. Watch mode can be enabled with `make jest JEST_ARGS=--watch`.
