import { z } from '@exodus/zod'
import KeyIdentifier from '@exodus/key-identifier'

type KeyIdentifierLike = ConstructorParameters<typeof KeyIdentifier>[0] | KeyIdentifier

const keyIdentifierLikeSchema = z
  .custom<KeyIdentifierLike>((value) => KeyIdentifier.validate(value))
  .transform((value) => (value instanceof KeyIdentifier ? value : new KeyIdentifier(value)))

export const keySourceSchema = z.strictObject({
  keyId: keyIdentifierLikeSchema,
  seedId: z.string(),
})

export const encryptSecretBoxParamsSchema = keySourceSchema.extend({
  data: z.instanceof(Buffer),
  deriveSecret: z.boolean().optional(),
})

export const decryptSecretBoxParamsSchema = encryptSecretBoxParamsSchema

export const encryptBoxParamsSchema = keySourceSchema.extend({
  data: z.instanceof(Buffer),
  toPublicKey: z.instanceof(Buffer),
})

export const decryptBoxParamsSchema = keySourceSchema.extend({
  data: z.instanceof(Buffer),
  fromPublicKey: z.instanceof(Buffer),
})

export const validated =
  <S extends z.Schema, F extends (params: z.output<S>) => any>(
    fn: F,
    schema: S
  ): ((params: z.input<S>) => ReturnType<F>) =>
  (params: unknown) => {
    const parsed = schema.parse(params)
    return fn(parsed)
  }
