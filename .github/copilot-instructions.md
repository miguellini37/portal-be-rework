# GitHub Copilot Instructions

## Project Context

This repository is a Node.js/TypeScript backend for a portal application. It uses Express, TypeORM, and MySQL. The codebase includes entities for users, athletes, companies, schools, and related business logic. Authentication uses JWTs. The project structure follows a modular approach with routes, entities, and configuration separated. Yarn is used as the package manager.

## Copilot Usage Guidelines

- Always use TypeORM's query builder or repository methods for database access.
- When adding filters or search, use the correct column names as defined in the database schema.
- For wildcard or multi-field search, ensure all joined tables/relations are properly included in the query builder before referencing their columns in WHERE clauses.
- When updating or creating entities, use nullish coalescing (`??`) to preserve existing values if new ones are not provided.
- For authentication, never include sensitive fields (like passwords) in JWT payloads or API responses.
- Always validate user input and handle errors gracefully with appropriate status codes and messages.
- Keep code modular and avoid duplicating logic across routes or services.

## Best Practices

- Use async/await for all asynchronous operations.
- Prefer explicit typing for function parameters and return types.
- Always use curly brackets {} for control structures (if, for, etc.).
- Use environment variables for secrets and configuration.
- Write clear, concise commit messages and PR descriptions.
- Document any non-obvious business logic or workarounds in code comments.
- Try to never typecast objects
- NEVER use `any` type. If you don't know the type, use `unknown` and narrow it down before using.
- NEVER use `npx` commands as this is not safe. If you need to run a command, add it to the package.json scripts and run it through `yarn`.

## Common Tasks

- Adding a new filter to a search endpoint: Join the necessary relation, add the filter to the query builder, and use the correct column name.
- Updating an entity: Use `Object.assign` or direct assignment, and always save the entity after mutation.
- Handling JWTs: Only include minimal, non-sensitive user info in the payload. Remove any `exp`, `iat`, or reserved claims before re-signing.

---

This file is intended to help Copilot and contributors follow project conventions and avoid common pitfalls.
