import * as React from "react";
import { Component, ComponentType } from "react";
import { FormikTouched, getActiveElement } from "formik";
import { omit, set, transform } from "lodash";

export interface ITranslations {
  [key: string]: {
    id: string;
    defaultMessage: string;
  };
}

type setTouched = <T = object>(touched: FormikTouched<T>) => void;

type setBackendErrors = (
  fields: IBackendErrors,
  setTouched: setTouched
) => void;

export interface IWithBackedErrors {
  backendErrors: object;
  fields: IBackendErrors;
  setBackendErrors: setBackendErrors;
  removeBackendError: (path: string) => void;
  validateBackendErrorsCallback: () => object;
}

export interface IBackendErrors {
  [key: string]: Array<string>;
}

export interface IWithBackendErrorsOptions {
  translations: ITranslations;
}

export const withBackedErrors = <T extends object>({
  translations
}: IWithBackendErrorsOptions) => (
  WrappedComponent: ComponentType<IWithBackedErrors>
) =>
  class extends Component {
    state = {
      backendErrors: {},
      fields: {}
    };

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          setBackendErrors={this.setBackendErrors}
          removeBackendError={this.removeBackendError}
          validateBackendErrorsCallback={this.validateBackendErrorsCallback}
        />
      );
    }

    setBackendErrors: setBackendErrors = (fields, setTouched) => {
      this.setState(() => {
        const backendErrors = transformBackendErrors(fields, translations);
        setTouched(backendErrors);
        return {
          backendErrors,
          fields
        };
      });
    };

    removeBackendError = (path: string) => {
      this.setState((state: IWithBackedErrors) => {
        const fields = omit(state.fields, path);
        return {
          backendErrors: transformBackendErrors(fields, translations),
          fields
        };
      });
    };

    validateBackendErrorsCallback = () => {
      const activeElement = getActiveElement();
      if (activeElement) {
        const activeElementName = activeElement.getAttribute("name");
        const activeElementId = activeElement.getAttribute("id");
        if (activeElementName) {
          this.removeBackendError(activeElementName);
        }
        if (activeElementId) {
          this.removeBackendError(activeElementId);
        }
      }
      return this.state.backendErrors;
    };
  };

export const transformBackendErrors = (
  backendErrors: IBackendErrors,
  translations: ITranslations
) => {
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
