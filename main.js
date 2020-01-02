// var strReg1 = /"(.*?)"/g,
//     strReg2 = /'(.*?)'/g,
    //specialReg = /\b(new|var|let|const|if|do|function|while|switch|for|foreach|in|continue|break)(?=[^\w])/g,
    // specialJsGlobReg = /\b(document|window|Array|String|Object|Number|\$)(?=[^\w])/g,
    // specialJsReg = /\b(getElementsBy(TagName|ClassName|Name)|getElementById|typeof|instanceof)(?=[^\w])/g,
    // specialMethReg = /\b(indexOf|match|toString|length)(?=[^\w])/g,
    // specialPhpReg  = /\b(define|echo|print_r|var_dump)(?=[^\w])/g,
    // specialCommentReg  = /(\/\*.*\*\/)/g,
    // inlineCommentReg = /(\/\/.*)/g;


const strFunctionExRgx = /(\w*)(?=\()/g,
    // string with formath "something"
    strStringJs1Reg = /"(.*?)"/g,
    //String has format: 'something'
    strStringJs2Reg = /'(.*?)'/g,
    // comment in a line, ex: //something
    strInlineCommentReg = /(\/\/.*)/g,
    // Comment in multiple rows
    strMultiCommentReg  = /(\/\*(.|\n)*\*\/)/g,
    // Teamplate string
    strStringTeamplateReg = /`(\w|\W)*`/g,
    // Regex strings, ex: /something/
    strRegexrReg = /\/(( )|([a-zA-Z0-9])|(\\(\ |\\|\/|\.|\$|\=|\{|\}|\(|\)|\!|\?|\w|\W|\d|\D|\b)))*\/[g|i|m|s|u|y]{0,6}/g,
    // Key arguments|const|let|var|function|false|true|of|in 
    strKeywordJs1Reg = /\b(arguments|const|let|var|function|false|true|of|in)(?=[ ])/g,
    // Key break|case|catch|do|while|else|finally|for
    strKeywordJs2Reg = /\b(break|case|catch|do|while|else|finally|for)(?=[ ])/g;



//var htmlTagReg = /(&lt;[^\&]*&gt;)/g;

var sqlReg = /\b(CREATE|ALL|DATABASE|TABLE|GRANT|PRIVILEGES|IDENTIFIED|FLUSH|SELECT|UPDATE|DELETE|INSERT|FROM|WHERE|ORDER|BY|GROUP|LIMIT|INNER|OUTER|AS|ON|COUNT|CASE|TO|IF|WHEN|BETWEEN|AND|OR)(?=[^\w])/g;

var list = document.querySelectorAll('.codeElements');
for (const item of list) {
    let parsed = item.innerHTML;

    //List string has format: "something"
    let listStringType1 = parsed.match(strStringJs1Reg)||[];
    parsed = parsed.replace(strStringJs1Reg,'@@StringType1@@');

    //list string has format: 'something'
    let listStringType2 = parsed.match(strStringJs1Reg)||[];
    parsed = parsed.replace(strStringJs2Reg,'@@StringType2@@');

    //list Regex strings, ex: /something/
    let listRegexr = parsed.match(strRegexrReg)||[];
    parsed = parsed.replace(strRegexrReg,'@@Regexr@@');

    //List comment in a line
    let listCommentInline = parsed.match(strInlineCommentReg)||[]; 
    parsed = parsed.replace(strInlineCommentReg,'@@CommentInline@@');

    //List comment multiple line
    let listCommentMulti = parsed.match(strMultiCommentReg)||[]; 
    parsed = parsed.replace(strMultiCommentReg,'@@CommentMulti@@');
    //List teamplate string, ex: `something`
    let listTeamplateString = parsed.match(strStringTeamplateReg);
    parsed = parsed.replace(strStringTeamplateReg,'@@StringTeamplate@@');
    //List Key arguments|const|let|var|function|false|true|of|in 
    let listKeywordJs1 = parsed.match(strKeywordJs1Reg);
    parsed = parsed.replace(strKeywordJs1Reg,'@@KeywordJs1@@');
    //List Key break|case|catch|do|while|else|finally|for
    let listKeywordJs2 = parsed.match(strKeywordJs2Reg);
    parsed = parsed.replace(strKeywordJs2Reg,'@@KeywordJs2@@');
    ///
                    


    //             .replace(strInlineCommentReg,'{{--cmInline--}}')
    //             .replace(strMultiCommentReg,'{{--cmMulti--}}')
    //             .replace(strStringTeamplateReg,'{{--stringTeamplate--}}')
    //             .replace(strStringJs1Reg,'<span class="stringJs">"$1"</span>')
    //             .replace(strStringJs2Reg,"<span class=\"stringJs\">'$1'</span>")
    //             .replace(strFunctionExRgx,'<span class="functionExJs">$1</span>')
    //             .replace(strKeywordJs1Rgx,'<span class="keywordJs1">$1</span>')
    //             .replace(strKeywordJs2Rgx,'<span class="keywordJs2">$1</span>')
    //             .replace(strMultiCommentReg,'<span class="commentJs">$1</span>')
    // for (const item of listCommentInline) {
    //     parsed = parsed.replace('{{--cmInline--}}',item)
    //                 .replace(strInlineCommentReg,'<span class="commentJs">$1</span>');
    // }
    // for (const item of listCommentMulti) {
    //     parsed = parsed.replace('{{--cmMulti--}}',item)
    //                 .replace(strMultiCommentReg,'<span class="commentJs">$1</span>');
    // }
    // //replace string teamplte
    // for (let item of listStringTeamplate) {
    //     const special1Reg = /\$}/g,        
    //             strStringInTeamplate = /([^\`(${.*})]*(?=\$))/g;
    //     let listSpecial1 = item.match(special1Reg)||[];
    //     item = item.replace(special1Reg,'%%==special1==%%')
    //                 .replace(strStringInTeamplate,'<span class="stringJs">$1</span>');
    //     for (const special1 of listSpecial1) {
    //         item =item.replace('%%==special1==%%','$}');
    //     }
    //     parsed = parsed.replace('{{--stringTeamplate--}}',item);
        
    // }
    item.innerHTML = parsed;
    
}
