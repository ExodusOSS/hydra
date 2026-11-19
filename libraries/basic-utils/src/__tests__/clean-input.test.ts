import test from '@exodus/test/tape'

import cleanInput from '../clean-input.js'

test('Remove spaces', (t) => {
  t.equal(cleanInput(' 123 '), '123')
  t.end()
})

test('Allow numbers, `.` and `,` only', (t) => {
  t.equal(cleanInput('1.2abc@!#'), '1.2')
  t.end()
})

test('Replace `,` to `.`', (t) => {
  t.equal(cleanInput('1,2'), '1.2')
  t.end()
})

test('Replace multiple `,` to a single `.`', (t) => {
  t.equal(cleanInput('1,,2'), '1.2')
  t.equal(cleanInput(',,'), '0.')
  t.end()
})

test('Remove `,` if it is a thousand separator', (t) => {
  t.equal(cleanInput('20,240.03'), '20240.03')
  t.end()
})

test('Drop extra zeros on the left at start', (t) => {
  t.equal(cleanInput('0'), '0')
  t.equal(cleanInput('00'), '0')
  t.equal(cleanInput('000'), '0')
  t.equal(cleanInput('0000000'), '0')
  t.end()
})

test('Support starting with `.`', (t) => {
  t.equal(cleanInput('.'), '0.')
  t.equal(cleanInput('0.'), '0.')
  t.equal(cleanInput('0.1'), '0.1')
  t.end()
})

test('Dont allow more than one dot', (t) => {
  t.equal(cleanInput('1'), '1')
  t.equal(cleanInput('1.2'), '1.2')
  t.equal(cleanInput('1.2.'), '1.2')
  t.equal(cleanInput('1.2.3.'), '1.2')
  t.equal(cleanInput('1.2.3.4'), '1.2')
  t.end()
})

test('Drops chars exceeding decimals', (t) => {
  t.equal(cleanInput('1.234', 1), '1.2')
  t.equal(cleanInput('1.234', 2), '1.23')
  t.equal(cleanInput('1.234', 3), '1.234')
  t.equal(cleanInput('1.', 0), '1')
  t.equal(cleanInput('1.2', 0), '1')
  t.equal(cleanInput('1.222244445'), '1.222244445')
  t.equal(cleanInput('1.222244445', 8), '1.22224444')
  t.end()
})

test('Remove leading zero when not decimal', (t) => {
  t.equal(cleanInput('01.234'), '1.234')
  t.equal(cleanInput('01'), '1')
  t.equal(cleanInput('07'), '7')
  t.equal(cleanInput('0'), '0')
  t.equal(cleanInput('0.123'), '0.123')
  t.end()
})

test('Remove multiple leading zeros when not decimal', (t) => {
  t.equal(cleanInput('001'), '1')
  t.equal(cleanInput('007'), '7')
  t.equal(cleanInput('0001234'), '1234')
  t.equal(cleanInput('001.234'), '1.234')
  t.equal(cleanInput('00.123'), '0.123')
  t.equal(cleanInput('000.123'), '0.123')
  t.end()
})
