import React, { useEffect } from "react"
import { setupTwoslashHovers } from "shiki-twoslash/dist/dom";
import Topic from "gatsby-theme-kb/src/components/Topic/index"
import "../../../app.css"

export default function MyTopic(props) {
  useEffect(setupTwoslashHovers, [])

  return (
    <div className="orta">
      <Topic {...props} />
    </div>
  )
}
