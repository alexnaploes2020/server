const slugify = require('slugify');

module.exports = string => {
  const slug = slugify(string, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
  });
  return `${slug}-${(Math.random() * 36 ** 6).toString(36)}`;
};
