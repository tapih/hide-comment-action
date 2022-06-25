import { toMinimize } from '../src/run'

describe('filter to minimize', () => {
  test('no filter', () => {
    expect(
      toMinimize(
        {
          id: `id`,
          body: `body`,
          isMinimized: false,
          url: `https://www.example.com`,
        },
        {
          authors: [],
          endsWith: [],
          startsWith: [],
          token: `token`,
          pullRequestNumber: undefined,
        }
      )
    ).toBeFalsy()
  })

  test('already minimized', () => {
    expect(
      toMinimize(
        {
          id: `id`,
          body: `body`,
          isMinimized: true,
          url: `https://www.example.com`,
          author: { login: 'github-actions', url: '', avatarUrl: '', resourcePath: '' },
        },
        {
          authors: ['github-actions'],
          endsWith: [],
          startsWith: [],
          token: `token`,
          pullRequestNumber: undefined,
        }
      )
    ).toBeFalsy()
  })

  test('authors filter', () => {
    expect(
      toMinimize(
        {
          id: `id`,
          body: `body`,
          isMinimized: false,
          url: `https://www.example.com`,
          author: { login: 'github-actions', url: '', avatarUrl: '', resourcePath: '' },
        },
        {
          authors: ['github-actions'],
          endsWith: [],
          startsWith: [],
          token: `token`,
          pullRequestNumber: undefined,
        }
      )
    ).toBeTruthy()
  })
  test('authors filter did not match', () => {
    expect(
      toMinimize(
        {
          id: `id`,
          body: `body`,
          isMinimized: false,
          url: `https://www.example.com`,
          author: { login: 'github-actions', url: '', avatarUrl: '', resourcePath: '' },
        },
        {
          authors: ['bot'],
          endsWith: [],
          startsWith: [],
          token: `token`,
          pullRequestNumber: undefined,
        }
      )
    ).toBeFalsy()
  })

  test('starts-with filter', () => {
    expect(
      toMinimize(
        {
          id: `id`,
          body: `<!-- head -->body`,
          isMinimized: false,
          url: `https://www.example.com`,
        },
        {
          authors: [],
          endsWith: [],
          startsWith: ['<!-- head -->'],
          token: `token`,
          pullRequestNumber: undefined,
        }
      )
    ).toBeTruthy()
  })
  test('starts-with filter did not match', () => {
    expect(
      toMinimize(
        {
          id: `id`,
          body: `body`,
          isMinimized: false,
          url: `https://www.example.com`,
        },
        {
          authors: [],
          endsWith: [],
          startsWith: ['<!-- head -->'],
          token: `token`,
          pullRequestNumber: undefined,
        }
      )
    ).toBeFalsy()
  })

  test('ends-with filter', () => {
    expect(
      toMinimize(
        {
          id: `id`,
          body: `body<!-- tail -->`,
          isMinimized: false,
          url: `https://www.example.com`,
        },
        {
          authors: [],
          endsWith: ['<!-- tail -->'],
          startsWith: [],
          token: `token`,
          pullRequestNumber: undefined,
        }
      )
    ).toBeTruthy()
  })
  test('ends-with filter did not match', () => {
    expect(
      toMinimize(
        {
          id: `id`,
          body: `body`,
          isMinimized: false,
          url: `https://www.example.com`,
        },
        {
          authors: [],
          endsWith: ['<!-- tail -->'],
          startsWith: [],
          token: `token`,
          pullRequestNumber: undefined,
        }
      )
    ).toBeFalsy()
  })
})
