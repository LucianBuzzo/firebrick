const dirTree = require('directory-tree');

const fileTree = (path = '/Users/Lucian/Music/') => {
  const tree = dirTree(path);
  console.log(tree);
  return tree;
};

module.exports = {
  fileTree,
};
