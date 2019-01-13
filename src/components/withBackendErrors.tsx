import * as React from "react";
import { Component, ComponentType } from "react";
import { FormikTouched, getActiveElement } from "formik";
import { set, transform, omit } from "lodash";

type setTouched = <T = object>(touched: FormikTouched<T>) => void;

type setBackendErrors = (backendErrors: object, setTouched: setTouched) => void;

export interface IWithBackedErrors {
  backendErrors: object;
  setBackendErrors: setBackendErrors;
  removeBackendError: (path: string) => void;
  validateBackendErrorsCallback: () => object;
}

type mapErrorsFn = (errors: any) => object;

const defaultMapErrorFn = (errors: object) => errors;

export const withBackedErrors = <T extends object>(
  mapErrors: mapErrorsFn = defaultMapErrorFn
) => (WrappedComponent: ComponentType<IWithBackedErrors>) =>
  class extends Component {
    state = {
      backendErrors: {}
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

    setBackendErrors: setBackendErrors = (backendErrors, setTouched) => {
      this.setState(() => {
        const errors = mapErrors(backendErrors);
        setTouched(errors);
        return {
          backendErrors: errors
        };
      });
    };

    removeBackendError = (path: string) => {
      this.setState((state: IWithBackedErrors) => {
        const flatErrors = flattenObject(state.backendErrors);
        const errorWithoutPath = omit(flatErrors, path);
        const errors = transform(
          errorWithoutPath,
          (result, value, key) => {
            set(result, key, value);
          },
          {}
        );

        return { backendErrors: errors };
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

const flattenObject = function(ob: any) {
  const toReturn: any = {};

  for (const i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == "object") {
      const flatObject = flattenObject(ob[i]);
      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + "." + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};
