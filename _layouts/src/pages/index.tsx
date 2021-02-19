import React, { useEffect} from "react"

export default () => {
  useEffect(() => {
    if (document.location && document.location.href.includes("orta")) document.location.replace("/notes/home")
    if (document.location && document.location.href.includes("localhost")) document.location.replace("/home")
  })
  return <html></html>
}
