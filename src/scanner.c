#include "tree_sitter/parser.h"

enum TokenType {
    CONCAT,
    COMMENT,
    STRING_CONTENT,
};

static bool is_concat_separator(int32_t c) {
    switch (c) {
        case 0:
        case ' ':
        case '\t':
        case '\n':
        case '\r':
        case ';':
        case '{':
        case '}':
        case '|':
        case '&':
        case '<':
        case '>':
        case '#':
            return true;
        default:
            return false;
    }
}

void* tree_sitter_grub_external_scanner_create(void) { return NULL; }

void tree_sitter_grub_external_scanner_destroy(void* payload) {}

unsigned tree_sitter_grub_external_scanner_serialize(void* payload,
                                                     char* buffer) {
    return 0;
}

void tree_sitter_grub_external_scanner_deserialize(void* payload,
                                                   const char* buffer,
                                                   unsigned length) {}

bool tree_sitter_grub_external_scanner_scan(void* payload, TSLexer* lexer,
                                            const bool* valid_symbols) {
    bool error_recovery = valid_symbols[CONCAT] && valid_symbols[COMMENT] &&
                          valid_symbols[STRING_CONTENT];

    if (!error_recovery && valid_symbols[STRING_CONTENT]) {
        bool has_content = false;
        while (lexer->lookahead != '"' && lexer->lookahead != '$' &&
               lexer->lookahead != 0) {
            if (lexer->lookahead == '\\') {
                has_content = true;
                lexer->advance(lexer, false);
                if (lexer->lookahead != 0) {
                    lexer->advance(lexer, false);
                }
            } else {
                has_content = true;
                lexer->advance(lexer, false);
            }
        }
        if (has_content) {
            lexer->result_symbol = STRING_CONTENT;
            return true;
        }
    }

    if (valid_symbols[CONCAT] && !is_concat_separator(lexer->lookahead) &&
        !lexer->eof(lexer)) {
        lexer->result_symbol = CONCAT;
        return true;
    }

    // COMMENT: skip horizontal whitespace, then check for #.
    // The built-in lexer won't retry the external scanner after
    // consuming regular extras, so we look past whitespace ourselves.
    // advance(skip=true) positions are reset if we return false.
    if (valid_symbols[COMMENT]) {
        while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
            lexer->advance(lexer, true);
        }
        if (lexer->lookahead == '#') {
            lexer->advance(lexer, false);
            while (lexer->lookahead != '\n' && lexer->lookahead != 0) {
                lexer->advance(lexer, false);
            }
            lexer->result_symbol = COMMENT;
            return true;
        }
    }

    return false;
}
