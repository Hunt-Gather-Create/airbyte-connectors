import {AxiosInstance} from 'axios';
import {AirbyteLogger, AirbyteLogLevel} from 'faros-airbyte-cdk';
import {log} from 'util';

import * as fut from '../src/index';
import {LinkedInPages} from '../src/LinkedInPages';

const linkedInPagesInstance = LinkedInPages.instance;
const TOKEN =
  'AQUEghvzQDLWvyWouj0NLlhuSHoAiP3XdtFjUIpTTLV9MQp3Bc7i5qpY4Xkgd3GhfsD0QGdmd_LSRfFkPaOxuXHtFGOosIj5pPno7VJs-wLPkZCLPxycOmJI-scp2vft9hm1j_GPxd9_q-_bTqO8OoKXZP-5TObXWY0TKjZ3JcCjgc8bYsI_eUDAohnEkVoJIUuimN3XjD2z5VndAZp28y2Wn6AhXDjZKBqu_n3bcATS2jrYL5CjUkjeZnYERK6n0wUNLDmVqNmCR__XKabjFVFranlddU-6gzuv4-i7qIlvYRw8VlIguidhf-fZofTgds0_sKwwSpDmZ592Cd_YseVea8yvkg';
const ORG_ID = 35571209;

describe('index', () => {
  const logger = new AirbyteLogger(
    // Shush messages in tests, unless in debug
    process.env.LOG_LEVEL === 'debug'
      ? AirbyteLogLevel.DEBUG
      : AirbyteLogLevel.FATAL
  );

  beforeEach(() => {
    LinkedInPages.instance = linkedInPagesInstance;
  });

  test('check connection', async () => {
    LinkedInPages.instance = jest.fn().mockImplementation(() => {
      return new LinkedInPages(jest.fn().mockResolvedValue({}) as any, ORG_ID);
    });

    const source = new fut.LinkedInPagesSource(logger);

    await expect(
      source.checkConnection({
        orgId: ORG_ID,
        token: TOKEN,
      })
    ).resolves.toStrictEqual([true, undefined]);
  });
});
