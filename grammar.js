/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
//
// Tree-sitter grammar for GRUB configuration files (grub.cfg).

const WORD_PATTERN = /[^{}|&$;<>\t\n\r\f\v '"\\]+/;

module.exports = grammar({
  name: 'grub',

  extras: $ => [
    /[ \t]/,
    $.comment,
  ],

  word: $ => $.simple_word,

  externals: $ => [
    $._concat,
    $.comment,
    $.string_content,
  ],

  supertypes: $ => [$._command],

  rules: {

    source_file: $ => repeat(choice(
      seq($._statement, $._terminator),
      $._terminator,
    )),

    _terminator: $ => choice(';', '\n'),

    _statement: $ => choice(
      $._command,
      $.function_definition,
    ),

    _command: $ => choice(
      $.simple_command,
      $.if_command,
      $.for_command,
      $.while_command,
      $.until_command,
    ),

    _body: $ => repeat1(choice(
      seq($._command, $._terminator),
      $._terminator,
    )),

    simple_command: $ => prec.left(seq(
      field('name', $._expression),
      repeat(field('argument', $._expression)),
      optional(field('body', $.block)),
    )),

    block: $ => seq('{', optional($._body), '}'),

    if_command: $ => seq(
      'if',
      field('condition', $._body),
      'then',
      field('consequence', $._body),
      optional(choice(
        field('alternative', $.elif_clause),
        seq('else', field('alternative', $._body)),
      )),
      'fi',
    ),

    elif_clause: $ => seq(
      'elif',
      field('condition', $._body),
      'then',
      field('consequence', $._body),
      optional(choice(
        field('alternative', $.elif_clause),
        seq('else', field('alternative', $._body)),
      )),
    ),

    for_command: $ => seq(
      'for',
      field('variable', $.simple_word),
      'in',
      repeat(field('value', $._expression)),
      $._terminator,
      'do',
      field('body', $._body),
      'done',
    ),

    while_command: $ => seq(
      'while',
      field('condition', $._body),
      'do',
      field('body', $._body),
      'done',
    ),

    until_command: $ => seq(
      'until',
      field('condition', $._body),
      'do',
      field('body', $._body),
      'done',
    ),

    function_definition: $ => seq(
      'function',
      field('name', $.simple_word),
      repeat('\n'),
      '{',
      optional($._body),
      '}',
    ),

    _expression: $ => choice(
      $._primary_expression,
      $.concatenation,
    ),

    _primary_expression: $ => choice(
      $.simple_word,
      $.word,
      $.variable_expansion,
      $.single_quoted_string,
      $.double_quoted_string,
      $.escape_sequence,
    ),

    concatenation: $ => prec(-1, seq(
      $._primary_expression,
      repeat1(seq($._concat, $._primary_expression)),
    )),

    simple_word: _ => /[a-zA-Z_][a-zA-Z0-9_#]*/,

    word: _ => token(prec(-1, WORD_PATTERN)),

    variable_expansion: _ => token(choice(
      seq('$', /[a-zA-Z_][a-zA-Z0-9_]*/),
      seq('${', /[a-zA-Z_][a-zA-Z0-9_]*/, '}'),
      seq('$', /[0-9]+/),
      seq('${', /[0-9]+/, '}'),
      seq('$', /[?@*#]/),
      seq('${', /[?@*#]/, '}'),
    )),

    single_quoted_string: _ => token(seq("'", /[^']*/, "'")),

    double_quoted_string: $ => seq(
      '"',
      repeat(choice(
        $.string_content,
        $.variable_expansion,
      )),
      '"',
    ),

    escape_sequence: _ => token(prec(-1, /\\[^\n]/)),
  },
});
