export const wrapConstant = ({ id, type, value }) => ({
  definition: {
    id,
    type,
    factory: () => value,
    public: true,
  },
})

export const withType =
  (type) =>
  ({ definition, ...rest }) => ({
    ...rest,
    definition: { type, ...definition },
  })
