// src/services/keycloak.service.ts
import { Injectable } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakService {
  private kcAdminClient: KcAdminClient;
  private isAuthenticated = false;

  constructor() {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_AUTH_SERVER_URL ?? 'http://localhost:8180',
      realmName: process.env.KEYCLOAK_REALM ?? 'portal',
    });
  }

  private async ensureAuthenticated() {
    if (!this.isAuthenticated) {
      // Authenticate using client credentials with manage-users role
      await this.kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'portal-backend',
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
      });
      this.isAuthenticated = true;
    }
  }

  async updateUserAttributes(
    userId: string,
    attributes: {
      permission?: string;
      schoolId?: string;
      companyId?: string;
      isOrgVerified?: string;
    }
  ): Promise<void> {
    await this.ensureAuthenticated();

    try {
      // First, fetch the existing user to get current attributes
      const existingUser = await this.kcAdminClient.users.findOne({ id: userId });

      if (!existingUser) {
        throw new Error(`User with ID ${userId} not found in Keycloak`);
      }

      // Merge existing attributes with new ones
      // Start with existing attributes
      const updatedAttributes = {
        ...(existingUser.attributes || {}),
      };

      // Only update provided attributes (undefined check, not falsy check)
      if (attributes.permission !== undefined) {
        updatedAttributes.permission = [attributes.permission];
      }
      if (attributes.schoolId !== undefined) {
        updatedAttributes.schoolId = [attributes.schoolId];
      }
      if (attributes.companyId !== undefined) {
        updatedAttributes.companyId = [attributes.companyId];
      }
      if (attributes.isOrgVerified !== undefined) {
        updatedAttributes.isOrgVerified = [attributes.isOrgVerified];
      }

      // Only send updatable fields to Keycloak
      const updatePayload = {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        username: existingUser.username,
        enabled: existingUser.enabled,
        emailVerified: existingUser.emailVerified,
        attributes: updatedAttributes,
      };

      await this.kcAdminClient.users.update({ id: userId }, updatePayload);
    } catch (error: unknown) {
      // If token expired, re-authenticate and retry
      const isUnauthorized =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 401;

      if (isUnauthorized) {
        this.isAuthenticated = false;
        await this.ensureAuthenticated();

        // Retry the entire operation
        const existingUser = await this.kcAdminClient.users.findOne({ id: userId });

        if (!existingUser) {
          throw new Error(`User with ID ${userId} not found in Keycloak`);
        }

        const updatedAttributes = {
          ...(existingUser.attributes || {}),
        };

        if (attributes.permission !== undefined) {
          updatedAttributes.permission = [attributes.permission];
        }
        if (attributes.schoolId !== undefined) {
          updatedAttributes.schoolId = [attributes.schoolId];
        }
        if (attributes.companyId !== undefined) {
          updatedAttributes.companyId = [attributes.companyId];
        }
        if (attributes.isOrgVerified !== undefined) {
          updatedAttributes.isOrgVerified = [attributes.isOrgVerified];
        }

        await this.kcAdminClient.users.update(
          { id: userId },
          {
            ...existingUser,
            attributes: updatedAttributes,
          }
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * Get user attributes from Keycloak (useful for debugging)
   */
  async getUserAttributes(userId: string): Promise<Record<string, string[]> | undefined> {
    await this.ensureAuthenticated();

    const user = await this.kcAdminClient.users.findOne({ id: userId });

    if (!user) {
      throw new Error(`User with ID ${userId} not found in Keycloak`);
    }

    return user.attributes;
  }

  /**
   * Get full user info from Keycloak including attributes
   */
  async getUserInfo(userId: string) {
    await this.ensureAuthenticated();

    const user = await this.kcAdminClient.users.findOne({ id: userId });

    if (!user) {
      throw new Error(`User with ID ${userId} not found in Keycloak`);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      attributes: user.attributes,
    };
  }
}
