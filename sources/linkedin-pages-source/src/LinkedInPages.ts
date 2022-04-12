import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AirbyteConfig, AirbyteLogger} from 'faros-airbyte-cdk';
import VError from 'verror';

const BASE_URL = 'https://api.linkedin.com/v2/';

export interface LinkedInPagesConfig {
  readonly token: string;
  readonly orgId: number;
}

export class LinkedInPages {
  private static axios: any;
  private static linkedInPages: LinkedInPages = null;

  constructor(
    private readonly httpClient: AxiosInstance,
    private readonly orgId: number
  ) {}

  static instance(config: LinkedInPagesConfig, _logger?: AirbyteLogger) {
    if (!config.token) {
      throw new VError('Gimme a token');
    }

    if (!config.orgId) {
      throw new VError('Gimme an org id');
    }

    const httpClient = axios.create({
      baseURL: BASE_URL,
      timeout: 5000, // default is `0` (no timeout)
      maxContentLength: 20000, //default is 2000 bytes
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });

    LinkedInPages.linkedInPages = new LinkedInPages(httpClient, config.orgId);

    return LinkedInPages.linkedInPages;
  }

  /**
   *
   */
  async checkConnection(): Promise<[boolean, VError]> {
    try {
      const {data} = await this.fetchNetworkSize();
      if (!data.firstDegreeSize) {
        throw new VError(
          'You should have a firstDegreeSize unless you are a noob'
        );
      }
    } catch (error) {
      return [false, error as VError];
    }

    return [true, undefined];
  }

  async fetchNetworkSize(): Promise<AxiosResponse> {
    return await this.httpClient.get(
      `networkSizes/urn:li:organization:${this.orgId}?edgeType=CompanyFollowedByMember`
    );
  }
}
