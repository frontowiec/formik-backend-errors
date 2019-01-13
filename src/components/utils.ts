import { set, transform } from "lodash";

export interface IBackendErrors {
  [key: string]: Array<string>;
}

export interface ITranslations {
  [key: string]: {
    id: string;
    defaultMessage: string;
  };
}

export const transformBackendErrors = (
  backendErrors: IBackendErrors,
  translations: ITranslations
): object => {
  return transform(
    backendErrors,
    (result, values, key) => {
      translateBackendError(key, values, result, translations);
    },
    {}
  );
};

export const translateBackendError = (
  key: string,
  values: string[],
  result: object,
  translations: ITranslations
) => {
  if (translations[key]) {
    set(result, key, translations[key].defaultMessage);
  } else {
    console.warn(
      `Missing translation "${key}": {id: "${key}_backend_error", defaultMessage: 
            "${values.join("_")}"}`
    );
    set(result, key, values.join(" "));
  }
};
