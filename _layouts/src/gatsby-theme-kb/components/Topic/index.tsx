import React, { useEffect } from "react"
import { setupTwoslashHovers } from "shiki-twoslash/dist/dom";
import Topic from "gatsby-theme-kb/src/components/Topic/index"
import "../../../app.css"
import Helmet from "react-helmet"


export default function MyTopic(props) {
  useEffect(setupTwoslashHovers, [])
  return (
    <div className="orta">
         <Helmet>
           <meta property="og:image" content={props.currentLocation.pathname + "/og-image.jpg"} />
        </Helmet>
      <Topic {...props} />
    </div>
  )
}
 