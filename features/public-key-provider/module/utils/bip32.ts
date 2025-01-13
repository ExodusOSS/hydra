export function* derivationPathsWithHardenedPrefix(derivationPath: string) {
  const parts = derivationPath.split('/')

  for (let i = parts.length - 1; i > 0; i--) {
    if (parts[i]?.endsWith("'")) return

    yield { derivationPath: parts.slice(0, i).join('/'), removedIndices: parts.slice(i) }
  }
}
