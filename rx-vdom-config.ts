type AllTags = keyof HTMLElementTagNameMap
export type Configuration = {
    TypeCheck: 'strict'
    SupportedHTMLTags: 'Dev' extends 'Prod' ? AllTags : DevTags
    WithFluxView: false
}

type DevTags =
    | 'div'
    | 'pre'
    | 'select'
    | 'i'
    | 'option'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h6'
    | 'ul'
    | 'li'
    | 'button'
    | 'input'
    | 'iframe'
    | 'img'
    | 'a'
    | 'p'
    | 'span'
