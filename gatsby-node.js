const crypto = require("crypto")
const { exec } = require("child_process")

exports.sourceNodes = ({ actions, createNodeId}, configOptions) => {
  const { createNode } = actions

  delete configOptions.plugins

  const processNode = (node) => {
    const nodeId = node.id
    const typeName = node.typeName

    delete node.id
    delete node.typeName

    const nodeContent = JSON.stringify(node)

    const nodeContentDigest = crypto
      .createHash("md5")
      .update(nodeContent)
      .digest("hex")

    const nodeData = Object.assign({}, node, {
      id: nodeId,
      parent: null,
      children: [],
      internal: {
	type: typeName,
	content: nodeContent,
	contentDigest: nodeContentDigest
      }
    })

    return createNode(nodeData)
  }

  return new Promise( async (resolve, reject) => { 
    exec('git log -1 --format="%H"', (err, stdout, stderr) => {
      if( err ) {
	reject("Error in child process")
      }

      const buildId = process.env.TRAVIS_BUILD_ID ? process.env.TRAIVS_BUILD_ID : "--"
      const buildNum = process.env.TRAVIS_BUILD_NUMBER ? process.env.TRAVIS_BUILD_NUMBER : "--"

      processNode({
	id: createNodeId(`git-commit-0`),
	typeName: "GitCommit",
	commitHash: stdout.slice(0, -1),
	travisId: buildId,
	travisNum: buildNum
      })

    })

    resolve()
  })
}
