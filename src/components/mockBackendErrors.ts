export const mockBackendErrors = {
  message: "Validation error",
  errors: {
    // messages: ["languages.tooFew", "nutsCodes.toFew"],
    fields: {
      "person.name": ["person.name.notBlank", "person.name.isExist"],
      "person.age": ["person.age.notBlank"]
    }
  }
};
