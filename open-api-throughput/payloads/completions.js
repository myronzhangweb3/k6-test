import { mergeDeep } from '../helpers/utils.js'

export const fimCompletion = ({
  prefix = '',
  suffix = '',
  ...rest
}) => {
  return mergeDeep({
    // max_tokens: 512,
    // temperature: 0,
    // seed: 0,
    // frequency_penalty: 1.25,
    // prompt: `<|fim_prefix|>${prefix}<|fim_suffix|>${suffix}<|fim_middle|>`
    messages: [
      {
        role: "user",
        content: "你好"
      },
      {
        role: "assistant",
        content: ""
      }
    ]
  }, rest);
}