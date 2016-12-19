const FS = require('fs');
const PATH = require('path');
const Track = require('./Track');

const whiteList = [
  '.mp3',
  '.wav'
];

'use strict';

const searchTree = function searchTree(element, matchingTitle) {
  if (element.title === matchingTitle) {
    return element;
  } else if (element.children !== null) {
    var i;
    var result = null;
    for (i = 0; result === null && i < element.children.length; i++) {
      result = searchTree(element.children[i], matchingTitle);
    }
    return result;
  }
  return null;
};

const directoryTree = function directoryTree (path) {
  const extensions = whiteList;
	const name = PATH.basename(path);
	const item = { path, name };
	let stats;

	try {
    stats = FS.statSync(path);
  } catch (e) {
    return null;
  }

	if (stats.isFile()) {
		const ext = PATH.extname(path).toLowerCase();
		if (extensions && extensions.length && extensions.indexOf(ext) === -1) {
      return null;
    }
    // File size in bytes
		item.size = stats.size;
		item.extension = ext;
    return new Track(item);
	} else if (stats.isDirectory()) {
		try {
			item.children = FS.readdirSync(path)
				.map(child => directoryTree(PATH.join(path, child), extensions))
				.filter(e => !!e);
			item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
		} catch (ex) {
			if (ex.code === "EACCES") {
				// User does not have permissions, ignore directory
				return null;
      }
		}
	} else {
    // Or set item.size = 0 for devices, FIFO and sockets ?
		return null;
	}
	return item;
};


const fileTree = (path) => {
  const tree = directoryTree(path);
  console.log(tree);
  return tree;
};

module.exports = {
  searchTree,
  fileTree,
};
