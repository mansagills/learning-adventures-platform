/**
 * Security utilities for the application.
 */

/**
 * Validates that an identifier (ID, slug, filename component) is safe for use in file paths.
 * Allows only alphanumeric characters, hyphens, and underscores.
 * Throws an error if the identifier is invalid.
 *
 * @param identifier The identifier to validate
 * @param context Optional context for the error message (e.g., "Game ID")
 */
export function validateIdentifier(identifier: string, context: string = 'Identifier'): void {
  if (!identifier) {
    throw new Error(`${context} cannot be empty`);
  }

  // Allow a-z, A-Z, 0-9, -, _
  const validPattern = /^[a-zA-Z0-9-_]+$/;

  if (!validPattern.test(identifier)) {
    throw new Error(
      `${context} "${identifier}" contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed.`
    );
  }
}
