import React from "react"
import { graphql,Link,navigate } from "gatsby"
import { Graph } from "react-d3-graph";
import Layout from "../layout/layout"
import "./graph.css"
const makeSlug = require("../utils/make-slug")

export default function Note({ pageContext, data }) {
  const post = data.markdownRemark

  // Create the data for the graph visualisation for the note linking.
  const graphData = {
    nodes: [{id: post.fields.title, color: "black"}],
    links: [],
    focusedNodeId: post.fields.title
  }

  // Links to the current Note
  for(let i = 0; i < pageContext.referredBy.length; i++) {
    const refNoteTitle = pageContext.referredBy[i]
    graphData.nodes.push({id: refNoteTitle })
    graphData.links.push({source: refNoteTitle, target: post.fields.title })
  }

  // Links from the current Note
  for(let i = 0; i < pageContext.refersTo.length; i++) {
    const refNoteTitle = pageContext.refersTo[i]
    graphData.nodes.push({id: refNoteTitle })
    graphData.links.push({source: post.fields.title, target: refNoteTitle })
  }

  const onClickNode = function(nodeId) {
    const slug = makeSlug(nodeId)
    navigate(`/${slug}`)
  };

  // the graph configuration, just override the ones you need
  const graphConfig = {
    automaticRearrangeAfterDropNode: true,
    directed: true,
    initialZoom: 1.4,
    // nodeHighlightBehavior: true,
    node: {
      color: "gray",
      size: 120,
      fontSize: 10,
    }
  };

  return (
    <Layout>
      <h1>{ post.fields.title }</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />

      { post.frontmatter.tags ? (
        <div id="tags">
          <h3>Tagged with:</h3>
          <ul>
          {post.frontmatter.tags.map((tag, index) => (
            <li key={index}><Link to={`/tags/${makeSlug(tag)}`}>{tag}</Link></li>
          ))}
          </ul>
        </div>
      ) : null }

      { pageContext.referredBy.length ? (
        <div id="back-links">
          <h3>Reffered By</h3>
          <ul>
          {pageContext.referredBy.map((title, index) => (
            <li key={index}><Link to={`/${makeSlug(title)}`}>{title}</Link></li>
          ))}
          </ul>
        </div>
        ) : null }

      <div id="graph-container">
        <Graph
          id="note-link-graph"
          data={graphData}
          config={graphConfig}
          onClickNode={onClickNode}
        />
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        title
        date(formatString: "DD MMMM, YYYY")
      }
      frontmatter {
        tags
      }
    }
  }
`