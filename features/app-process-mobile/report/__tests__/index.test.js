import { createInMemoryAtom } from '@exodus/atoms'
import appProcessReportDefinition from '..'

describe('appProcessReport', () => {
  test('exports history in human readable format', async () => {
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

    const appStateHistoryAtom = createInMemoryAtom({ defaultValue: history })
    const report = appProcessReportDefinition.factory({ appStateHistoryAtom })
    const exported = await report.export()

    expect(exported).toEqual({
      history: [
        { ...history[0], timestamp: expect.any(String) },
        { ...history[1], timestamp: expect.any(String) },
      ],
    })
  })
})
