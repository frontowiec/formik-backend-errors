import * as React from "react";
import { ErrorMessage, Field, Form, FormikProps, withFormik } from "formik";
import { Component } from "react";
import * as Yup from "yup";
import { compose } from "recompose";
import { IWithBackedErrors, withBackedErrors } from "./withBackendErrors";
import { mockBackendErrors } from "./mockBackendErrors";
import { mockBackendErrorsTranslations } from "./mockBackendErrorsTranslations";

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
          <button
            onClick={() => {
              this.props.setBackendErrors(
                mockBackendErrors.errors.fields,
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
        <h5>Status:</h5>
        <pre>{JSON.stringify(status, null, 2)}</pre>
        <h5>Values:</h5>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    );
  }
}

const validationSchema = Yup.object<ISampleForm>().shape({
  person: Yup.object<IPerson>().shape({
    name: Yup.string().required("Pole jest wymagane."),
    age: Yup.number()
      .min(18, "Minimalny wiek to 18")
      .max(60, "Maksymalny wiek to 60")
      .required("Pole jest wymagane.")
  }),
  isActive: Yup.boolean()
});

export default compose<any, any>(
  withBackedErrors<ISampleForm>({
    translations: mockBackendErrorsTranslations
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
      return validateBackendErrorsCallback();
    },
    validationSchema: validationSchema
  })
)(SampleForm);
