import axios from 'axios';
import {
  AirbyteLogger,
  AirbyteLogLevel,
  AirbyteSpec,
  SyncMode,
} from 'faros-airbyte-cdk';
import fs from 'fs-extra';
import {VError} from 'verror';

import {AzureGit} from '../src/azuregit';
import * as sut from '../src/index';

const azureGit = AzureGit.instance;

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('index', () => {
  test('ok?', async () => {
    expect('OK').toEqual('OK');
  });
});

describe('index', () => {
  const logger = new AirbyteLogger(
    // Shush messages in tests, unless in debug
    process.env.LOG_LEVEL === 'debug'
      ? AirbyteLogLevel.DEBUG
      : AirbyteLogLevel.FATAL
  );

  beforeEach(() => {
    AzureGit.instance = azureGit;
  });

  function readTestResourceFile(fileName: string): any {
    return JSON.parse(fs.readFileSync(`test_files/${fileName}`, 'utf8'));
  }

  test('spec', async () => {
    const source = new sut.AzureGitSource(logger);
    await expect(source.spec()).resolves.toStrictEqual(
      new AirbyteSpec(readTestResourceFile('spec.json'))
    );
  });

  test('check connection - no access token', async () => {
    const source = new sut.AzureGitSource(logger);
    await expect(
      source.checkConnection({
        access_token: '',
        organization: 'organization',
        project: 'project',
      } as any)
    ).resolves.toStrictEqual([
      false,
      new VError('access_token must be a not empty string'),
    ]);
  });

  test('streams - repositories, use full_refresh sync mode', async () => {
    const fnRepositoriesFunc = jest.fn();

    AzureGit.instance = jest.fn().mockImplementation(() => {
      const repositoriesResource: any[] =
        readTestResourceFile('repositories.json');
      return new AzureGit(
        {
          get: fnRepositoriesFunc.mockResolvedValue({
            data: {value: repositoriesResource},
          }),
        } as any,
        null,
        null
      );
    });
    const source = new sut.AzureGitSource(logger);
    const streams = source.streams({} as any);

    const repositoriesStream = streams[0];
    const repositoryIter = repositoriesStream.readRecords(
      SyncMode.FULL_REFRESH
    );
    const repositories = [];
    for await (const repository of repositoryIter) {
      repositories.push(repository);
    }
    expect(fnRepositoriesFunc).toHaveBeenCalledTimes(2);
    expect(repositories).toStrictEqual(
      readTestResourceFile('repositories.json')
    );
  });
});