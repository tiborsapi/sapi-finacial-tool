# Release build of the backend, used for performance runs (the dev image is an
# unoptimised `cargo watch` build, so its timings say little about production).
FROM rust:1-slim-bookworm AS build
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential pkg-config \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/src ./src
COPY backend/migrations ./migrations
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=build /app/target/release/finance_management_backend /usr/local/bin/finance_management_backend
EXPOSE 8080
CMD ["finance_management_backend"]
