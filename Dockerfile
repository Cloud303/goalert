##############
PLEASE READ!!!
##############

# This Dockerfile only builds on a Linux machine. Mainly because of the tested MAKE command. This could work in other OS' but we have not tested with it because of lack of time.
# The LOGOUT_URL argument is passed in during run time. This argument is different in all environments. It was used to logout a user authenticated session from KeyCloak to successfully accomplish a full logout. 
# Build commands used for both DEV and PROD envs. are below. Eventually, this will be rolled into the CI/CD process, but for now, when building the container, use the --build-arg flag

# Dev: docker build -t goalert-nonprod-base-image:versionNumber . --build-arg LOGOUT_URL=https://keycloak.dev.c303.io/realms/c303-dev-internal/protocol/openid-connect/logout
# Prod: docker build -t goalert-prod-base-image:versionNumber . --build-arg LOGOUT_URL=https://hub.cloud303.io/realms/cloud303/protocol/openid-connect/logout


FROM docker.io/goalert/build-env:go1.18.2-postgres13 AS build
ARG LOGOUT_URL #passed i
COPY / /build/
WORKDIR /build
RUN make bin/build/goalert-linux-amd64 LOGOUT_URL=$LOGOUT_URL

FROM docker.io/library/alpine
RUN apk --no-cache add ca-certificates
ENV GOALERT_LISTEN :8081
EXPOSE 8081
CMD ["/usr/bin/goalert"]

COPY --from=build /build/bin/build/goalert-linux-amd64/goalert/bin/* /usr/bin/
RUN /usr/bin/goalert self-test
