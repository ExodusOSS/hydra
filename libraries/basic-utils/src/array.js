// Returns a shuffled copy of the array
// Shuffling is not CSPRNG-random!
// Do not cache .random / do not destructurize Math to make this mockable in tests
export function shuffled(input) {
  if (!Array.isArray(input)) throw new Error('Expected an array')
  const arr = [...input]
  const len = arr.length
  for (let i = 0; i < len - 1; i++) {
    const idx = i + Math.floor(Math.random() * (len - i))
    const value = arr[i]
    arr[i] = arr[idx]
    arr[idx] = value
  }

  return arr
}
