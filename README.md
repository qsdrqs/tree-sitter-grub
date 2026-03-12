# tree-sitter-grub

[Tree-sitter](https://tree-sitter.github.io/) grammar for GRUB configuration files (`grub.cfg`).

## Features

- Commands, arguments, variable expansions (`$var`, `${var}`)
- Single/double-quoted strings with structured internals
- Compound commands: `if`/`elif`/`else`/`fi`, `for`/`do`/`done`, `while`, `until`
- Function definitions, blocks (`menuentry`, `submenu`)
- Concatenation of adjacent tokens (`$root/path`, `"str"$var`)
- Context-sensitive `#` handling (comment at token boundary, literal mid-word)

## Usage

```sh
tree-sitter generate
tree-sitter test
tree-sitter parse /path/to/grub.cfg
```

## License

MIT
