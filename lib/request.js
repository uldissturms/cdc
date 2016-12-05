module.exports.log = ({method, path, headers, payload}) => {
  const message = `method:${method.toUpperCase()} path:${path} headers:${JSON.stringify(headers)} body: ${JSON.stringify(payload)}`
  console.log(message)
}
