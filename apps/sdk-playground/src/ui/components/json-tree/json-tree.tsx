import { JSONTree as ReactJSONTree } from 'react-json-tree'

// see more here https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes
const jsonTreeTheme = {
  scheme: 'default',
  author: 'chris kempson (http://chriskempson.com)',
  base00: 'transparent',
  base01: '#282828',
  base02: '#383838',
  base03: '#585858',
  base04: '#b8b8b8',
  base05: '#d8d8d8',
  base06: '#e8e8e8',
  base07: '#f8f8f8',
  base08: '#ab4642',
  base09: '#dc9656',
  base0A: '#f7ca88',
  base0B: '#a1b56c',
  base0C: '#86c1b9',
  base0D: '#64748b',
  base0E: '#ba8baf',
  base0F: '#a16946',
}

export default function JSONTree({ data, postprocessValue }) {
  return (
    <ReactJSONTree data={data} hideRoot theme={jsonTreeTheme} postprocessValue={postprocessValue} />
  )
}
