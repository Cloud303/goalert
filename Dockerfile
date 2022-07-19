# Builds only on Linux OS.
FROM docker.io/goalert/build-env:go1.18.2-postgres13 AS build
ARG LOGOUT_URL
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
