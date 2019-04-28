module.exports = {
  regMatch: {
    REG_AND: /^\$&$/g,
    REG_OR: /^\$\|$/g,
    REG_NOT: /^\$\^$/g,
    REG_RULEPATH: /^\$(\.\w+)+/g,
    REG_LT: /^\$</g,
    REG_LTE: /^\$<=/g,
    REG_GT: /^\$>/g,
    REG_GTE: /^\$>=/g,
    REG_NOTEQUAL: /^\$!=/g,
    REG_BETWEEN: /^\$<>/g,
    REG_EXP: /^\$\$/g
  }
}
