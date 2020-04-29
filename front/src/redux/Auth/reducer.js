import { types as actionsTypes } from "./actions";

const initialState = {
  isLoading: false,
  user: null,
  error: null,
  info: null,
  passwordResetRequired: false,
  acm: {
    all: false,
    academie: [],
    apiKey: "",
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionsTypes.FETCH_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case actionsTypes.FETCH_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.user,
        error: null,
        info: null,
      };
    case actionsTypes.SET_ACM:
      return {
        ...state,
        acm: action.acm,
      };
    case actionsTypes.FETCH_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
        user: null,
        error: action.error,
        info: null,
      };
    case actionsTypes.INFO:
      return {
        ...state,
        info: action.info,
      };
    case actionsTypes.CHANGE_PASSWORD:
      return {
        ...state,
        isLoading: false,
        user: action.user,
        passwordResetRequired: true,
      };
    case actionsTypes.SIGN_OUT:
      return {
        ...state,
        isLoading: false,
        user: null,
        error: null,
        info: null,
      };
    default:
      return state;
  }
};

export default reducer;
