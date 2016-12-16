const dirTree = require('directory-tree');

const fileTree = (path = '/Users/Lucian/Music/') => {
  const tree = dirTree(path);
  return tree;
};

module.exports = {
  fileTree,
};
