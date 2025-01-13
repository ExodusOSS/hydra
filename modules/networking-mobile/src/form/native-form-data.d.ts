declare module 'react-native/Libraries/Network/FormData' {
  export type FormDataValue = string | { name?: string; type?: string; uri: string }
  export type FormDataNameValuePair = [string, FormDataValue]

  type Headers = { [name: string]: string }
  export type FormDataPart =
    | {
        string: string
        headers: Headers
      }
    | {
        uri: string
        headers: Headers
        name?: string
        type?: string
      }

  export default class FormData {
    _parts: FormDataNameValuePair[]
    append(key: string, value: FormDataValue): void
    getParts(): Array<FormDataPart>
  }
}
