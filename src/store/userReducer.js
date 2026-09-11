const getInitialUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem("user");
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const initialState = {
  user: getInitialUser(),
  isLoading: false,
  isError: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOG_IN":
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } catch {}
      }
      return {
        ...state,
        isLoading: false,
        isError: false,
        user: action.payload,
      };

    case "LOADING":
      return {
        ...state,
        isLoading: true,
        isError: false, // Reset error flag when loading starts
      };

    case "SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
      };

    case "ERROR":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };

    case "LOG_OUT":
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("user");
        } catch {}
      }
      return {
        ...state,
        isLoading: false,
        isError: false,
        user: null,
      };

    default:
      // If the action type is not recognized, return the unchanged state
      return state;
  }
};

export default reducer;
