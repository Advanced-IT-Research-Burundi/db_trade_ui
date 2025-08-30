import {  SET_LOCALE, } from "../reducers/appReducer"


export const setLocaleAction = (locale) => {
    return {
              type: SET_LOCALE,
              payload: locale
    }
}