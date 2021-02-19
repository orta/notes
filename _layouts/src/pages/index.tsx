import React, { useEffect} from "react"

export default () => {
  useEffect(() => {
    if (document.location) document.location.replace("/home")
  })
  return <html></html>
}
