// src/config/graph.config.ts
// Microsoft Graph API Configuration and Client Initialization

import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

/**
 * Graph API Configuration Interface
 */
export interface GraphConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  authority: string;
  scopes: string[];
}

/**
 * Initialize Graph API Client for daemon app (server-to-server)
 * Using Client Credentials flow
 */
export async function initializeGraphClient(): Promise<Client> {
  const { ClientCredentialAuthProvider } = await import(
    '@microsoft/microsoft-graph-client/authProviders/cjs'
  );

  const config: GraphConfig = {
    clientId: process.env.GRAPH_CLIENT_ID || '',
    clientSecret: process.env.GRAPH_CLIENT_SECRET || '',
    tenantId: process.env.GRAPH_TENANT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.GRAPH_TENANT_ID || 'common'}/v2.0`,
    scopes: [
      'https://graph.microsoft.com/.default',
    ],
  };

  // Validate configuration
  if (!config.clientId || !config.clientSecret || !config.tenantId) {
    console.warn('Graph API configuration incomplete. Some features may not work.');
  }

  // Create authentication provider
  const authProvider = new ClientCredentialAuthProvider({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authority: config.authority,
    scopes: config.scopes,
  });

  // Create Graph client
  const graphClient = Client.initWithMiddleware({
    authProvider,
  });

  return graphClient;
}

/**
 * Get Graph API Client instance (singleton pattern)
 */
let graphClientInstance: Client | null = null;

export async function getGraphClient(): Promise<Client> {
  if (!graphClientInstance) {
    graphClientInstance = await initializeGraphClient();
  }
  return graphClientInstance;
}

/**
 * Graph API folder structure constants
 */
export const GRAPH_FOLDERS = {
  FACULTY: 'Faculty',
  STUDENTS: 'Students',
  ACCREDITATION: 'Accreditation',
  EVIDENCE: 'Evidence',
  DOCUMENTS: 'Documents',
  ARCHIVES: 'Archives',
};

/**
 * Graph API item types
 */
export enum GraphItemType {
  FOLDER = 'folder',
  FILE = 'file',
  DOCUMENT = 'document',
}

/**
 * Permission levels for Graph items
 */
export enum PermissionLevel {
  READ = 'read',
  EDIT = 'edit',
  MANAGE = 'manage',
  ADMIN = 'admin',
}

/**
 * Graph API endpoints
 */
export const GRAPH_ENDPOINTS = {
  DRIVE_ITEMS: '/me/drive/root/children',
  SEARCH: '/me/drive/root/microsoft.graph.itemContainer/search(q=\'{query}\')',
  RECENT: '/me/drive/recent',
  SHARED_WITH_ME: '/me/drive/sharedWithMe',
};

/**
 * Error handling for Graph API
 */
export class GraphApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public graphError?: any
  ) {
    super(message);
    this.name = 'GraphApiError';
  }
}

/**
 * Validate Graph API response
 */
export function validateGraphResponse(response: any): boolean {
  if (!response) {
    throw new GraphApiError(400, 'Empty response from Graph API');
  }
  if (response.error) {
    throw new GraphApiError(
      response.error.code ? parseInt(response.error.code) : 400,
      response.error.message || 'Unknown Graph API error',
      response.error
    );
  }
  return true;
}

/**
 * Format Graph API file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file is previewable
 */
export function isPreviewableFile(filename: string): boolean {
  const previewableExtensions = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'txt', 'csv', 'json', 'xml', 'jpg', 'jpeg', 'png', 'gif'
  ];
  const ext = filename.split('.').pop()?.toLowerCase();
  return previewableExtensions.includes(ext || '');
}

export default {
  initializeGraphClient,
  getGraphClient,
  GRAPH_FOLDERS,
  GraphItemType,
  PermissionLevel,
  GRAPH_ENDPOINTS,
  GraphApiError,
  validateGraphResponse,
  formatFileSize,
  isPreviewableFile,
};
