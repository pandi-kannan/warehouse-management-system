package com.example.warehouse.config;

import com.example.warehouse.secuirity.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── PRODUCTS ──────────────────────────────────────────
                        // GET: both roles can view
                        .requestMatchers(HttpMethod.GET, "/api/products/**").hasAnyRole("ADMIN", "OPERATOR")
                        // POST / PUT / DELETE: ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // ── ORDERS ────────────────────────────────────────────
                        // GET + PUT status: both roles
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasAnyRole("ADMIN", "OPERATOR")
                        // POST (create order): ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/orders/**").hasRole("ADMIN")

                        // ── INVENTORY ─────────────────────────────────────────
                        // Both roles can receive, dispatch, view
                        .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN", "OPERATOR")

                        // ── DASHBOARD ─────────────────────────────────────────
                        .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "OPERATOR")

                        // ── WAREHOUSES & BINS ─────────────────────────────────
                        // ADMIN only
                        .requestMatchers("/api/warehouses/**").hasRole("ADMIN")
                        .requestMatchers("/api/bins/**").hasRole("ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) ->
                                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                        .accessDeniedHandler((req, res, e) ->
                                res.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied"))
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
