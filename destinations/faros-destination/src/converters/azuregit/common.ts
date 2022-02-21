import {AirbyteRecord} from 'faros-airbyte-cdk';

import {Converter} from '../converter';
import {
  PullRequestReviewState,
  PullRequestReviewStateCategory,
  PullRequestState,
  PullRequestStateCategory,
} from './models';

export type ApplicationMapping = Record<
  string,
  {name: string; platform?: string}
>;

interface AzuregitConfig {
  application_mapping?: ApplicationMapping;
}

/** Azuregit converter base */
export abstract class AzuregitConverter extends Converter {
  /** Almost every Azuregit record have id property */
  id(record: AirbyteRecord): any {
    return record?.record?.data?.id;
  }

  getOrganizationFromUrl(url: string): string {
    return url.split('/')[3];
  }

  //https://docs.microsoft.com/en-us/rest/api/azure/devops/git/pull-requests/get-pull-requests?view=azure-devops-rest-4.1#pullrequeststatus
  convertPullRequestState(status: string): PullRequestState {
    switch (status) {
      case 'completed':
        return {
          category: PullRequestStateCategory.Closed,
          detail: status,
        };
      case 'active':
        return {
          category: PullRequestStateCategory.Merged,
          detail: status,
        };
      case 'notSet':
        return {
          category: PullRequestStateCategory.Open,
          detail: status,
        };
      default:
        return {
          category: PullRequestStateCategory.Custom,
          detail: status,
        };
    }
  }

  convertPullRequestReviewState(vote: number): PullRequestReviewState {
    if (vote > 5)
      return {
        category: PullRequestReviewStateCategory.Approved,
        detail: `vote ${vote}`,
      };
    if (vote > 0)
      return {
        category: PullRequestReviewStateCategory.Commented,
        detail: `vote ${vote}`,
      };
    if (vote > -5)
      return {
        category: PullRequestReviewStateCategory.Custom,
        detail: `vote ${vote}`,
      };
    return {
      category: PullRequestReviewStateCategory.Dismissed,
      detail: `vote ${vote}`,
    };
  }
}