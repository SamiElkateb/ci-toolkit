interface TypeErrorParams {
  location?: string;
  varName: string;
  type: string;
}
class TypeError {
  readonly message: string;

  constructor(params: TypeErrorParams) {
    const { location, varName, type } = params;
    if (location) {
      this.message = `${location}: ${varName} should be of type ${type}`;
      return;
    }
    this.message = `${varName} should be of type ${type}`;
  }
}
export default TypeError;
