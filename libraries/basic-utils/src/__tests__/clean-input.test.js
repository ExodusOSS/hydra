// eslint-disable-next-line import/no-unresolved
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
