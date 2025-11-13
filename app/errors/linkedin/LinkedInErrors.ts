import { BaseError } from '../BaseError';

export class InvalidLinkedInUrlError extends BaseError {
  constructor(url?: string) {
    super(
      'The provided LinkedIn URL is invalid.',
      'INVALID_LINKEDIN_URL',
      400,
      { url, expectedFormat: 'https://www.linkedin.com/in/username/' },
      'LinkedInService.generateCV',
      'Provide a valid LinkedIn profile URL in the format: https://www.linkedin.com/in/username/'
    );
  }
}

export class LinkedInScrapingError extends BaseError {
  constructor(message: string, details?: any) {
    super(
      message || 'Failed to scrape LinkedIn profile.',
      'LINKEDIN_SCRAPING_FAILED',
      503,
      details,
      'LinkedInScraperService.scrapeLinkedInProfile',
      'Verify that the LinkedIn URL is accessible and the BrightData API key is valid.'
    );
  }
}

export class BrightDataApiError extends BaseError {
  constructor(statusCode: number, responseData?: any) {
    super(
      'BrightData API request failed.',
      'BRIGHTDATA_API_ERROR',
      503,
      { apiStatusCode: statusCode, response: responseData },
      'LinkedInScraperService.scrapeLinkedInProfile',
      'Check your BrightData API key and ensure the service is operational.'
    );
  }
}

export class ProfileNotFoundError extends BaseError {
  constructor(url: string) {
    super(
      'LinkedIn profile could not be found in the API response.',
      'PROFILE_NOT_FOUND',
      404,
      { url },
      'LinkedInScraperService.findLinkedInProfile',
      'Ensure the LinkedIn URL points to a valid public profile.'
    );
  }
}

export class CVMappingError extends BaseError {
  constructor(message: string, details?: any) {
    super(
      message || 'Failed to map LinkedIn data to CV format.',
      'CV_MAPPING_FAILED',
      500,
      details,
      'CVMapperService.mapLinkedInToCV',
      'Check if the LinkedIn profile data structure is complete and valid.'
    );
  }
}

export class CVCreationError extends BaseError {
  constructor(message: string, details?: any) {
    super(
      message || 'Failed to create CV in database.',
      'CV_CREATION_FAILED',
      500,
      details,
      'LinkedInHandler.generateCVFromLinkedIn',
      'Check database connection and ensure all required fields are provided.'
    );
  }
}

export class CVSyncError extends BaseError {
  constructor(
    message?: string,
    details?: any,
    context = 'LinkedInHandler.generateCVFromLinkedIn',
    statusCode = 500
  ) {
    super(
      message || 'Failed to synchronize LinkedIn data with CV.',
      'CV_SYNC_FAILED',
      statusCode,
      details,
      context,
      'Verify the CV exists, belongs to the user, and all required fields are provided.'
    );
  }
}

export class MissingBrightDataKeyError extends BaseError {
  constructor() {
    super(
      'BrightData API key is not configured.',
      'MISSING_BRIGHTDATA_KEY',
      500,
      { envVar: 'BRIGHTDATA_API_KEY' },
      'LinkedInScraperService.scrapeLinkedInProfile',
      'Set the BRIGHTDATA_API_KEY environment variable in your .env file.'
    );
  }
}
