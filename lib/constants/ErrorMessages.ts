const ERROR_MESSAGES = {
  noConfig: 'No config file was found',
  unknownGitlabApiError: 'Unknown Gitlab Api error',
  isRequired: (property: string) => `${property} is required`,
  shouldBeString: (property: string) => `${property} should be a string`,
  shouldBeNumber: (property: string) => `${property} should be a number`,
  shouldBeBoolean: (property: string) => `${property} should be a boolean`,
  shouldStartWith: (property: string) => `${property} is a variable and should start with $_`,
  shouldBeValidPath: (property: string) => `${property} should be a valid file path`,
  shouldBeValidPaths: (property: string) => `${property} should be a valid file paths`,
  shouldBeArrayOfStrings: (property: string) => `${property} should be an array of strings`,
};

export default ERROR_MESSAGES;
