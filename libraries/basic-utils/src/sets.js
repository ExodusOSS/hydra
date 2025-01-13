export const areSetsEqual = (setA, setB) => {
  if (setA.size !== setB.size) return false
  if (setA.isSubsetOf) return setA.isSubsetOf(setB)

  for (const item of setA) {
    if (!setB.has(item)) {
      return false
    }
  }

  return true
}
