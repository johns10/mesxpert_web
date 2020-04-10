export function searchTree (element, id, key) {
  if (element[key] === id) {
    return element
  } else if (element.children != null) {
    var i
    var result = null
    for (i = 0; result == null && i < element.children.length; i++) {
      result = searchTree(element.children[i], id, key)
    }
    return result
  }
  return null
}
