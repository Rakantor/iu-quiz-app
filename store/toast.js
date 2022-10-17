export const state = () => ({
  content: '',
  color: '',
  timeout: 5000
})

export const mutations = {
  showMessage (state, {content, color, timeout}) {
    state.content = content
    state.color = color
    if (timeout) state.timeout = timeout
    else state.timeout = 5000
  }
}