import React, { useEffect } from "react"
import Topic from "gatsby-theme-kb/src/components/Topic/index"
import "../../../app.css"
import Helmet from "react-helmet"
import { withPrefix } from "gatsby";


export default function MyTopic(props) {
  return (
    <div className="orta">
         <Helmet>
          <meta property="twitter:domain" content="orta.io"/>
          <meta name="twitter:card" content="summary_large_image"/>
          <meta property="og:image" content={"https://orta.io" + withPrefix(props.file.fields.slug + "/og-image.jpg")} />
        </Helmet>
      <Topic {...props} />
    </div>
  )
}
 