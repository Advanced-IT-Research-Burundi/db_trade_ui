
export const SET_LOCALE  = "SET_LOCALE"

const initial = {
          locale: "fr"
}
export default function appReducer(contributionState = initial, action) {
          switch (action.type) {
                    case SET_LOCALE:
                              return {...contributionState, locale: action.payload}
                    default:
                              return contributionState
          }
}