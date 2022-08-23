interface TypeErrorParams {
  location?: string;
  varName: string;
  type: string;
}
class TypeError extends Error {
  constructor(params: TypeErrorParams) {
    const { location, varName, type } = params;
    if (location) {
      const message = `${location}: ${varName} should be of type ${type}`;
      super(message);
      return;
    }
    const message = `${varName} should be of type ${type}`;
    super(message);
  }
}
export default TypeError;
