require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name                = "RNNFTViewer"
  s.version             = package['version']
  s.summary             = package['description']
  s.homepage            = "https://github.com/ExodusMovement/react-native-nft-viewer"
  s.license             = package['license']
  s.author              = package['author']
  s.source              = { :git => 'https://github.com/ExodusMovement/react-native-nft-viewer.git', :tag => "v#{s.version}" }
  s.default_subspec     = 'Core'
  s.requires_arc        = true
  s.platform            = :ios, "7.0"

  s.dependency 'React'

  s.subspec 'Core' do |ss|
    ss.source_files     = "ios/*.{h,m}"
  end

end
