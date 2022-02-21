import {AirbyteRecord} from 'faros-airbyte-cdk';
import {Utils} from 'faros-feeds-sdk/lib';

import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {AzuregitConverter} from './common';
import {User, UserType, UserTypeCategory} from './models';

export class AzuregitUsers extends AzuregitConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'vcs_Membership',
    'vcs_User',
  ];

  async convert(
    record: AirbyteRecord,
    ctx: StreamContext
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const source = this.streamName.source;
    const userItem = record.record.data as User;
    const res: DestinationRecord[] = [];
    const organizationName = this.getOrganizationFromUrl(
      userItem._link.self.href
    );
    const organization = {uid: organizationName, source};
    const type: UserType = {
      category: UserTypeCategory.User,
      detail: userItem.subjectKind,
    };
    res.push({
      model: 'vcs_Membership',
      record: {
        organization,
        user: {uid: userItem.originId, source},
      },
    });

    res.push({
      model: 'vcs_User',
      record: {
        uid: userItem.originId,
        name: userItem.displayName,
        type,
        htmlUrl: userItem.url,
        source,
      },
    });
    return res;
  }
}
