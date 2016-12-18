const dirTree = require('directory-tree');

const whiteList = [
  '.mp3',
  '.wav'
];

const fileTree = (path = '/Users/Lucian/Music/') => {
  const tree = dirTree(path, whiteList);
  return tree;
};

module.exports = {
  fileTree,
};
