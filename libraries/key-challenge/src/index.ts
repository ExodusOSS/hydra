const TYPE = 'exodus/challenge/v1'

type ChallengeEnvelope = {
  verifier: string
  purpose: string
}

type SerializeChallengeParams = ChallengeEnvelope & {
  challenge: string
}

type ParseChallengeParams = ChallengeEnvelope & {
  plaintext: string
}

const assertedPrefix = ({ verifier, purpose }: ChallengeEnvelope): string =>
  `${TYPE}:${JSON.stringify({ verifier, purpose }).slice(0, -1)},"`

export const serializeChallenge = ({
  verifier,
  purpose,
  challenge,
}: SerializeChallengeParams): string =>
  `${TYPE}:${JSON.stringify({ verifier, purpose, challenge })}`

export const parseChallenge = ({ plaintext, verifier, purpose }: ParseChallengeParams): string => {
  if (!plaintext.startsWith(assertedPrefix({ verifier, purpose }))) {
    throw new Error('Payload is not a challenge for this verifier and purpose')
  }

  const { challenge } = JSON.parse(plaintext.slice(TYPE.length + 1)) as { challenge?: unknown }

  if (typeof challenge !== 'string') {
    // oxlint-disable-next-line unicorn/prefer-type-error -- changing the thrown type changes published behavior; deferred to a release window
    throw new Error('Challenge carries no nonce')
  }

  return challenge
}
