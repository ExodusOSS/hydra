#!/usr/bin/env node

const path = require('path')
const applyPatch = require('../apply-patch')
const { reactNativeVersion, directories } = require('../../utils/context')

const isProd = Boolean(process.env.PROD === 'true' || process.env.IS_PROD_MACHINE)
const isQa = process.env.QA === 'true'
const useCustomHermes = isProd || isQa

const hermesSource = useCustomHermes
  ? `# Custom Exodus Hermes binaries
source[:http] = "https://github.com/ExodusMovement/hermes/releases/download/0.0.7/ios.tar.gz"
source[:sha256] = "1a2ab8efc8f7db9c0e2b6c7f8d72dc2b8d79a26332167a4811d3f6a75fc78cda"
`
  : `# Regular binaries
source[:http] = "https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/0.71.11/react-native-artifacts-0.71.11-hermes-ios-debug.tar.gz"
source[:sha256] = "ada154e8e0293fff0afb5f38dc3ee2d8cc97cf85bcc390fee495650196fd4b9f"
`

const changes = [
  {
    file: path.join(
      directories.nodeModules.prod.absolute,
      'react-native/sdks/hermes-engine/hermes-engine.podspec'
    ),
    before: `if ENV.has_key?('HERMES_ENGINE_TARBALL_PATH')
  Pod::UI.puts "[Hermes] Using pre-built Hermes binaries from local path: #{ENV['HERMES_ENGINE_TARBALL_PATH']}".yellow if Object.const_defined?("Pod::UI")
  source[:http] = "file://#{ENV['HERMES_ENGINE_TARBALL_PATH']}"
elsif isInMain
  Pod::UI.puts '[Hermes] Installing hermes-engine may take slightly longer, building Hermes compiler from source...'.yellow if Object.const_defined?("Pod::UI")
  source[:git] = git
  source[:commit] = \`git ls-remote https://github.com/facebook/hermes main | cut -f 1\`.strip
elsif isNightly
  Pod::UI.puts '[Hermes] Nightly version, download pre-built for Hermes'.yellow if Object.const_defined?("Pod::UI")
  destination_path = download_nightly_hermes(react_native_path, version)
  # set tarball as hermes engine
  source[:http] = "file://#{destination_path}"
elsif File.exist?(hermestag_file) && isInCI
  Pod::UI.puts '[Hermes] Detected that you are on a React Native release branch, building Hermes from source but fetched from tag...'.yellow if Object.const_defined?("Pod::UI")
  hermestag = File.read(hermestag_file).strip
  source[:git] = git
  source[:tag] = hermestag
else
  # Sample url from Maven:
  # https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/0.71.0/react-native-artifacts-0.71.0-hermes-ios-debug.tar.gz
  source[:http] = "https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/#{version}/react-native-artifacts-#{version}-hermes-ios-#{build_type.to_s}.tar.gz"
end`,
    after: hermesSource,
  },
]

const fixPodspecs = () => {
  if (reactNativeVersion !== '0.71.11') throw new Error('broken podspecs fix')

  console.log('# Fixing podspecs')
  changes.forEach(({ before, after, file }) => {
    applyPatch(file, before, after)
  })
}

fixPodspecs()
