export type Frame = {
  function?: string
  method?: string
  file?: string
  line?: number
  column?: number
  async?: boolean
  toplevel?: boolean
  in_app?: boolean
}
