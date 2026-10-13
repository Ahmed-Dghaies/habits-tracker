import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";

import { habitsApi } from "@/lib/habitsApi";

import type { ReactElement } from "react";

export function renderWithProvider(element: ReactElement) {
  const store = configureStore({
    reducer: {
      [habitsApi.reducerPath]: habitsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(habitsApi.middleware),
  });

  return {
    store,
    ...render(<Provider store={store}>{element}</Provider>),
  };
}
