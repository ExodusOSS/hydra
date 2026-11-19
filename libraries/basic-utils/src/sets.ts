export const areSetsEqual = <T>(setA: Set<T>, setB: Set<T>): boolean => {
  if (setA.size !== setB.size) return false
  if (setA.isSubsetOf) return setA.isSubsetOf(setB)

  for (const item of setA) {
    if (!setB.has(item)) {
      return false
    }
  }

  return true
}
