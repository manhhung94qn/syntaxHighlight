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
    strStringJs1Reg = /"(.*?)"/g,
    strInlineCommentReg = /(\/\/.*)/g,
    strMultiCommentReg  = /(\/\*(.|\n)*\*\/)/g,
    strStringJs2Reg = /'(.*?)'/g,
    strKeywordJs1Rgx = /\b(arguments|const|let|var|function|false|true|of|in)(?=[ ])/g,
    strKeywordJs2Rgx = /\b(break|case|catch|do|while|else|finally|for)(?=[ ])/g,
    strStringTeamplateReg = /`(\w|\W)*`/g;



//var htmlTagReg = /(&lt;[^\&]*&gt;)/g;

var sqlReg = /\b(CREATE|ALL|DATABASE|TABLE|GRANT|PRIVILEGES|IDENTIFIED|FLUSH|SELECT|UPDATE|DELETE|INSERT|FROM|WHERE|ORDER|BY|GROUP|LIMIT|INNER|OUTER|AS|ON|COUNT|CASE|TO|IF|WHEN|BETWEEN|AND|OR)(?=[^\w])/g;

var list = document.querySelectorAll('.codeElements');
for (const item of list) {
    let htmlContent = item.innerHTML;
    let listCommentInline = htmlContent.match(strInlineCommentReg)||[]; 
    let listCommentMulti = htmlContent.match(strMultiCommentReg)||[]; 
    let listStringTeamplate = htmlContent.match(strStringTeamplateReg)||[];
    let parsed = htmlContent
                .replace(strInlineCommentReg,'{{--cmInline--}}')
                .replace(strMultiCommentReg,'{{--cmMulti--}}')
                .replace(strStringTeamplateReg,'{{--stringTeamplate--}}')
                .replace(strStringJs1Reg,'<span class="stringJs">"$1"</span>')
                .replace(strStringJs2Reg,"<span class=\"stringJs\">'$1'</span>")
                .replace(strFunctionExRgx,'<span class="functionExJs">$1</span>')
                .replace(strKeywordJs1Rgx,'<span class="keywordJs1">$1</span>')
                .replace(strKeywordJs2Rgx,'<span class="keywordJs2">$1</span>')
                .replace(strMultiCommentReg,'<span class="commentJs">$1</span>')
    for (const item of listCommentInline) {
        parsed = parsed.replace('{{--cmInline--}}',item)
                    .replace(strInlineCommentReg,'<span class="commentJs">$1</span>');
    }
    for (const item of listCommentMulti) {
        parsed = parsed.replace('{{--cmMulti--}}',item)
                    .replace(strMultiCommentReg,'<span class="commentJs">$1</span>');
    }
    //replace string teamplte
    for (let item of listStringTeamplate) {
        const special1Reg = /\$}/g,        
                strStringInTeamplate = /([^\`(${.*})]*(?=\$))/g;
        let listSpecial1 = item.match(special1Reg)||[];
        item = item.replace(special1Reg,'%%==special1==%%')
                    .replace(strStringInTeamplate,'<span class="stringJs">$1</span>');
        for (const special1 of listSpecial1) {
            item =item.replace('%%==special1==%%','$}');
        }
        parsed = parsed.replace('{{--stringTeamplate--}}',item);
        
    }
    item.innerHTML = parsed;
    
}
