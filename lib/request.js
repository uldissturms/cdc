module.exports.log = ({ method, path, payload }) => {
  const message = `received ${method}: ${path}`
  console.log(message)
}
