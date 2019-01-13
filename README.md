# Example of usage `withBackendErrors`

```js
import * as React from "react";
import { ErrorMessage, Field, Form, FormikProps, withFormik } from "formik";
import { Component } from "react";
import * as Yup from "yup";
import { compose } from "recompose";
import { IWithBackedErrors, withBackedErrors } from "./withBackendErrors";
import { set, transform } from "lodash";

interface IPerson {
  name: string;
  age: number;
}

interface ISampleForm {
  person: IPerson;
  isActive: boolean;
}

class SampleForm extends Component<
  FormikProps<ISampleForm> & IWithBackedErrors
> {
  render() {
    const { values, errors, status } = this.props;

    return (
      <div>
        <Form>
          <label>Name</label>
          <Field name="person.name" />
          <ErrorMessage name="person.name" />
          <Field name="person.age" type="number" />
          <ErrorMessage name="person.age" />
          <Field name="isActive" type="checkbox" />
          <ErrorMessage name="isActive" />
          {/*1st call setBackendErrors to create backend errors state*/}
          <button
            onClick={() => {
              this.props.setBackendErrors(
                backendErrors.errors.fields,
                this.props.setTouched
              );
            }}
            type="button"
          >
            Validate form
          </button>
          <button type="submit" disabled={!this.props.isValid}>
            Send sample form
          </button>
        </Form>
        <h5>Errors:</h5>
        <pre>{JSON.stringify(errors, null, 2)}</pre>
        <h5>Values:</h5>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    );
  }
}

const validationSchema = Yup.object<ISampleForm>().shape({
  person: Yup.object<IPerson>().shape({
    name: Yup.string().required("Field is required."),
    age: Yup.number()
      .min(18, "Max age is 18")
      .max(60, "Min age is 60")
      .required("Field is required.")
  }),
  isActive: Yup.boolean()
});

export const backendErrors = {
  message: "Validation error",
  errors: {
    fields: {
      "person.name": ["person.name.notBlank", "person.name.isExist"],
      "person.age": ["person.age.notBlank"]
    }
  }
};

export default compose<any, any>(
  /*2nd use withBackedErrors to pass formik backend errors as prop, if backend errors structure is not as FormikErrors then use function to map values*/
  withBackedErrors<ISampleForm>(errors => {
    return transform(
      errors,
      (result, values: string[], key: string) => {
        set(result, key, values.join(" "));
      },
      {}
    );
  }),
  withFormik<IWithBackedErrors, ISampleForm>({
    mapPropsToValues() {
      return {
        person: {
          name: "",
          age: 0
        },
        isActive: false
      };
    },
    handleSubmit() {
      console.log("submit");
    },
    validate: (values, { validateBackendErrorsCallback }) => {
      /*3rd tell fromik to validate backend errors*/
      return validateBackendErrorsCallback();
    },
    validationSchema: validationSchema
  })
)(SampleForm);

```