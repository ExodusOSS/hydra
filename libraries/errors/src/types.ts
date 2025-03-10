export type Frame = {
  function?: string | null
  method?: string | null
  file?: string | null
  line?: number | null
  column?: number | null
  async?: boolean | null
  toplevel?: boolean | null
  in_app?: boolean | null
}
