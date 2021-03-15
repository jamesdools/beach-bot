
const getArguments = (content) => {
  const args = content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  console.log(`args: ${command}`);
  console.log(`command: ${command}`);

  return { args, command };
}

module.exports = { getArguments };