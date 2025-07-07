import { createInMemoryAtom } from '@exodus/atoms'

import { APP_PROCESS_INITIAL_STATE } from '../../constants.js'
import appProcessReportDefinition from '..'

const history = [
  {
    from: 'background',
    to: 'active',
    timeInBackground: 200,
    timeLastBackgrounded: 0,
    timestamp: new Date(),
  },
  {
    from: 'active',
    to: 'end',
    timeInBackground: 200,
    timeLastBackgrounded: 0,
    timestamp: new Date(),
  },
]

describe('appProcessReport', () => {
  let appStateHistoryAtom
  let appProcessAtom
  let report

  beforeEach(() => {
    const history = [
      {
        from: 'background',
        to: 'active',
        timeInBackground: 200,
        timeLastBackgrounded: 0,
        timestamp: new Date(),
      },
      {
        from: 'active',
        to: 'end',
        timeInBackground: 200,
        timeLastBackgrounded: 0,
        timestamp: new Date(),
      },
    ]

    appStateHistoryAtom = createInMemoryAtom({ defaultValue: history })
    appProcessAtom = createInMemoryAtom({ defaultValue: APP_PROCESS_INITIAL_STATE })
    report = appProcessReportDefinition.factory({ appStateHistoryAtom, appProcessAtom })
  })

  test('exports history in human readable format', async () => {
    const exported = report.getSchema().parse(await report.export({ walletExists: true }))

    expect(exported).toEqual({
      history: [
        { ...history[0], timestamp: expect.any(String) },
        { ...history[1], timestamp: expect.any(String) },
      ],
      startTime: expect.any(String),
    })
  })
})
