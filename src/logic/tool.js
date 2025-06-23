class Tool {
  constructor(name) {
    this.name = name
  }

  static PAINTBRUSH = new Tool('Paintbrush')
  static ERASER = new Tool('Eraser')
  static BUCKET = new Tool('Bucket')
  static EYEDROPPER = new Tool('Eyedropper')

  toString() {
    return this.name
  }
}

export default Tool