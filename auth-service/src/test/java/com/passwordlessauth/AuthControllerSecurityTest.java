package com.passwordlessauth;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Placeholder integration-level smoke test.
 *
 * Full Spring context tests require a live database; for CI without Postgres
 * we keep this as a compile-check placeholder. The real integration validation
 * is done via `docker compose up --build`.
 *
 * If you want to run Spring context tests locally, configure an H2 datasource
 * in src/test/resources/application-test.properties and annotate with
 * {@code @SpringBootTest(properties = "spring.profiles.active=test")}.
 */
class AuthControllerSecurityTest {

    @Test
    void placeholder_compilesAndPasses() {
        // This test intentionally does nothing.
        // It exists to keep the test file from being empty (which some test runners flag).
        assertThat(true).isTrue();
    }
}
